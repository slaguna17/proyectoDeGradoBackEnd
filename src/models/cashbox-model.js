// src/models/cashbox-model.js
const db = require('../config/db');
const dayjs = require('dayjs');

// Helpers
const toNum = (v) => Number(v || 0);
const normalizeDate = (d) => dayjs(d || new Date()).format('YYYY-MM-DD');

const CashboxModel = {
  // --- Sesión de caja: una por tienda y día ---
  openCashbox: async (store_id, opening_amount) => {
    const today = normalizeDate();

    const existing = await db('cash_summary')
      .where({ store_id, opened_on: today, status: 'open' })
      .first();

    if (existing) return 'already_open';

    const [cashbox] = await db('cash_summary')
      .insert({
        store_id,
        opening_amount,
        status: 'open',
        opened_at: db.fn.now(),
        opened_on: today, // <- usamos columna DATE para índices/consultas
        created_at: db.fn.now(),
        updated_at: db.fn.now()
      })
      .returning('*');

    return cashbox;
  },

  // Buscar sesión abierta por tienda/fecha
  findOpenByStoreAndDate: async ({ store_id, date }) => {
    const d = normalizeDate(date);
    return db('cash_summary')
      .where({ store_id, opened_on: d, status: 'open' })
      .first();
  },

  // Obtener sesión por id
  getSessionById: async (id) => db('cash_summary').where({ id }).first(),

  // --- Movimientos manuales ---
  createMovement: async ({ store_id, cash_summary_id, user_id, direction, amount, category, notes }) => {
    const [row] = await db('cash_movement')
      .insert({
        store_id,
        cash_summary_id,
        user_id,
        direction,                 // 'IN' | 'OUT' | 'ADJUST'
        amount,
        category: category || null,
        notes: notes || null,
        created_at: db.fn.now(),
        updated_at: db.fn.now()
      })
      .returning('*');
    return row;
  },

  listMovementsBySession: async (cash_summary_id) => {
    return db('cash_movement')
      .where({ cash_summary_id })
      .orderBy('created_at', 'desc');
  },

  saveCashCount: async (cash_summary_id, items) => {
    if (!Array.isArray(items) || !items.length) return;
    await db('cash_count').where({ cash_summary_id }).del();

    const rows = items.map((it) => ({
      cash_summary_id,
      currency: it.currency || 'BOB',
      denomination: it.denomination,
      quantity: it.quantity,
      created_at: db.fn.now(),
      updated_at: db.fn.now()
    }));

    await db.batchInsert('cash_count', rows, 50);
  },

  getCashCount: async (cash_summary_id) => {
    return db('cash_count')
      .where({ cash_summary_id })
      .orderBy([{ column: 'currency', order: 'asc' }, { column: 'denomination', order: 'asc' }]);
  },

  // --- Totales de una sesión (para dashboard/reportes) ---
  computeTotalsForSessionId: async (session_id) => {
    const session = await db('cash_summary').where({ id: session_id }).first();
    if (!session) return null;

    const date = session.opened_on || normalizeDate(session.opened_at);

    // Ventas "cash/efectivo" del día
    const [{ sum: salesCashSum }] = await db('sales')
      .where('store_id', session.store_id)
      .andWhereRaw('DATE(created_at) = ?', [date])
      .andWhere(function () {
        this.whereRaw(`LOWER(COALESCE(payment_method,'')) IN ('cash','efectivo')`);
      })
      .sum({ sum: 'total' });

    // Compras "cash/efectivo" del día
    const [{ sum: purchaseCashSum }] = await db('purchase')
      .where('store_id', session.store_id)
      .andWhereRaw('DATE(created_at) = ?', [date])
      .andWhere(function () {
        this.whereRaw(`LOWER(COALESCE(payment_method,'')) IN ('cash','efectivo')`);
      })
      .sum({ sum: 'total' });

    // Movimientos manuales
    const [{ sum: manualInSum }] = await db('cash_movement')
      .where({ cash_summary_id: session_id, direction: 'IN' })
      .sum({ sum: 'amount' });

    const [{ sum: manualOutSum }] = await db('cash_movement')
      .where({ cash_summary_id: session_id, direction: 'OUT' })
      .sum({ sum: 'amount' });

    const opening = toNum(session.opening_amount);
    const salesCash = toNum(salesCashSum);
    const purchasesCash = toNum(purchaseCashSum);
    const manualIn = toNum(manualInSum);
    const manualOut = toNum(manualOutSum);

    const expectedClosing = opening + salesCash + manualIn - purchasesCash - manualOut;
    const closingAmount = session.closing_amount != null ? toNum(session.closing_amount) : null;
    const difference = closingAmount != null ? closingAmount - expectedClosing : null;

    return {
      session,
      opening,
      salesCash,
      purchasesCash,
      manualIn,
      manualOut,
      expectedClosing,
      closingAmount,
      difference
    };
  },

  // Cerrar caja (con opción de registrar conteo)
  closeCashbox: async ({ store_id, user_id, date, closing_amount, cash_count }) => {
    const d = normalizeDate(date);

    return await db.transaction(async (trx) => {
      const summary = await trx('cash_summary')
        .where({ store_id, opened_on: d, status: 'open' })
        .first();

      if (!summary) {
        throw new Error('No open cash box found for the given store and date');
      }

      // Agregados del día (cash)
      const [{ sum: salesCashSum }] = await trx('sales')
        .where('store_id', summary.store_id)
        .andWhereRaw('DATE(created_at) = ?', [d])
        .andWhere(function () {
          this.whereRaw(`LOWER(COALESCE(payment_method,'')) IN ('cash','efectivo')`);
        })
        .sum({ sum: 'total' });

      const [{ sum: purchaseCashSum }] = await trx('purchase')
        .where('store_id', summary.store_id)
        .andWhereRaw('DATE(created_at) = ?', [d])
        .andWhere(function () {
          this.whereRaw(`LOWER(COALESCE(payment_method,'')) IN ('cash','efectivo')`);
        })
        .sum({ sum: 'total' });

      const [{ sum: manualInSum }] = await trx('cash_movement')
        .where({ cash_summary_id: summary.id, direction: 'IN' })
        .sum({ sum: 'amount' });

      const [{ sum: manualOutSum }] = await trx('cash_movement')
        .where({ cash_summary_id: summary.id, direction: 'OUT' })
        .sum({ sum: 'amount' });

      const opening = toNum(summary.opening_amount);
      const salesCash = toNum(salesCashSum);
      const purchasesCash = toNum(purchaseCashSum);
      const manualIn = toNum(manualInSum);
      const manualOut = toNum(manualOutSum);

      const expected = opening + salesCash + manualIn - purchasesCash - manualOut;
      const finalClosing = closing_amount != null ? Number(closing_amount) : expected;
      const isProfit = finalClosing - expected >= 0;

      // Guardar conteo si llega
      if (Array.isArray(cash_count) && cash_count.length) {
        await trx('cash_count').where({ cash_summary_id: summary.id }).del();
        const rows = cash_count.map((it) => ({
          cash_summary_id: summary.id,
          currency: it.currency || 'BOB',
          denomination: it.denomination,
          quantity: it.quantity,
          created_at: trx.fn.now(),
          updated_at: trx.fn.now()
        }));
        await trx.batchInsert('cash_count', rows, 50);
      }

      const [updated] = await trx('cash_summary')
        .where({ id: summary.id })
        .update({
          closing_amount: finalClosing,
          closed_at: trx.fn.now(),
          status: 'closed',
          isProfit
        })
        .returning('*');

      return updated;
    });
  },

  // Listado por rango
  listSessions: async ({ store_id, from, to }) => {
    let q = db('cash_summary').where('store_id', store_id);
    if (from) q.andWhere('opened_on', '>=', normalizeDate(from));
    if (to) q.andWhere('opened_on', '<=', normalizeDate(to));
    return q.orderBy('opened_at', 'desc');
  }
};

module.exports = CashboxModel;
