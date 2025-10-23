const db = require('../config/db');
const dayjs = require('dayjs');

// Helpers
const toNum = (v) => Number(v || 0);
const normalizeDate = (d) => dayjs(d || new Date()).format('YYYY-MM-DD');

const CashboxModel = {
  // --- Cash Session: one for store and day ---
  openCashbox: async (store_id, opening_amount) => {
    const today = normalizeDate();

    const existing = await db('cash_session')
      .where({ store_id, opened_on: today, status: 'open' })
      .first();

    if (existing) return 'already_open';

    const [session] = await db('cash_session')
      .insert({
        store_id,
        opening_amount,
        status: 'open',
        opened_on: today,
      })
      .returning('*');

    return session;
  },

  findOpenByStoreAndDate: async ({ store_id, date }) => {
    const d = normalizeDate(date);
    return db('cash_session').where({ store_id, opened_on: d, status: 'open' }).first();
  },

  getSessionById: async (id) => db('cash_session').where({ id }).first(),

  // --- Money Movements ---
  createMovement: async (data) => {
    const [row] = await db('cash_movement').insert(data).returning('*');
    return row;
  },

  listMovementsBySession: async (cash_session_id) => {
    return db('cash_movement')
      .where({ cash_session_id })
      .orderBy('created_at', 'desc');
  },

  // --- Money Count ---
  saveCashCount: async (cash_session_id, items) => {
    if (!Array.isArray(items) || !items.length) return;
    await db('cash_count').where({ cash_session_id }).del();

    const rows = items.map((it) => ({
      cash_session_id, 
      currency: it.currency || 'BOB',
      denomination: it.denomination,
      quantity: it.quantity,
    }));

    await db.batchInsert('cash_count', rows, 50);
  },

  getCashCount: async (cash_session_id) => { 
    return db('cash_count').where({ cash_session_id }).orderBy('denomination', 'asc');
  },

  computeTotalsForSessionId: async (session_id) => {
    const session = await db('cash_session').where({ id: session_id }).first(); 
    if (!session) return null;

    // Sum all incomes for the session
    const { sum: totalIn } = await db('cash_movement')
      .where({ cash_session_id: session.id, direction: 'IN' })
      .sum({ sum: 'amount' })
      .first();

    // Sum all expenses for the session
    const { sum: totalOut } = await db('cash_movement')
      .where({ cash_session_id: session.id, direction: 'OUT' })
      .sum({ sum: 'amount' })
      .first();

    const opening = toNum(session.opening_amount);
    const income = toNum(totalIn);
    const expenses = toNum(totalOut);

    const expectedClosing = opening + income - expenses;
    const closingAmount = session.closing_amount != null ? toNum(session.closing_amount) : null;
    const difference = closingAmount != null ? closingAmount - expectedClosing : null;

    return {
      session,
      opening,
      income, // Total income
      expenses, // Total expenses
      expectedClosing,
      closingAmount,
      difference,
    };
  },

  closeCashbox: async ({ store_id, date, closing_amount, cash_count }) => {
    const d = normalizeDate(date);

    return db.transaction(async (trx) => {
      const session = await trx('cash_session')
        .where({ store_id, opened_on: d, status: 'open' })
        .first();

      if (!session) {
        throw new Error('No se encontró una caja abierta para esta tienda y fecha');
      }

      const totals = await CashboxModel.computeTotalsForSessionId(session.id);
      const expected = totals.expectedClosing;
      const finalClosing = closing_amount != null ? toNum(closing_amount) : expected;

      if (Array.isArray(cash_count) && cash_count.length) {
        await CashboxModel.saveCashCount(session.id, cash_count);
      }

      const [updated] = await trx('cash_session')
        .where({ id: session.id })
        .update({
          closing_amount: finalClosing,
          closed_at: trx.fn.now(),
          status: 'closed',
        })
        .returning('*');

      return updated;
    });
  },

  listSessions: async ({ store_id, from, to }) => {
    let q = db('cash_session').where('store_id', store_id);
    if (from) q.andWhere('opened_on', '>=', normalizeDate(from));
    if (to) q.andWhere('opened_on', '<=', normalizeDate(to));
    return q.orderBy('opened_at', 'desc');
  },
};

module.exports = CashboxModel;