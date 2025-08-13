// src/services/cashbox-service.js
const CashboxModel = require('../models/cashbox-model');

const CashboxService = {
  // Abrir
  openCashbox: async (store_id, opening_amount) => {
    return await CashboxModel.openCashbox(store_id, opening_amount);
  },

  // Cerrar (acepta opcionales: closing_amount y cash_count[])
  closeCashbox: async ({ store_id, user_id, date, closing_amount, cash_count }) => {
    if (!store_id || !user_id || !date) {
      throw new Error('store_id, user_id and date are required');
    }
    return await CashboxModel.closeCashbox({ store_id, user_id, date, closing_amount, cash_count });
  },

  // Movimiento manual
  createMovement: async ({ store_id, user_id, direction, amount, category, notes, date }) => {
    if (!store_id || !user_id || !direction || amount == null) {
      const e = new Error('store_id, user_id, direction and amount are required');
      e.status = 400;
      throw e;
    }
    if (!['IN', 'OUT', 'ADJUST'].includes(direction)) {
      const e = new Error("Invalid direction. Use 'IN', 'OUT' or 'ADJUST'.");
      e.status = 400;
      throw e;
    }
    if (Number(amount) <= 0) {
      const e = new Error('Amount must be greater than zero.');
      e.status = 400;
      throw e;
    }

    const session = await CashboxModel.findOpenByStoreAndDate({ store_id, date });
    if (!session) {
      const e = new Error('There is no open cash session for this store/date');
      e.status = 409;
      throw e;
    }

    return await CashboxModel.createMovement({
      store_id,
      cash_summary_id: session.id,
      user_id,
      direction,
      amount,
      category,
      notes
    });
  },

  // Sesión abierta de HOY (con totales)
  getCurrent: async (store_id) => {
    const session = await CashboxModel.findOpenByStoreAndDate({ store_id, date: new Date() });
    if (!session) return null;
    return await CashboxModel.computeTotalsForSessionId(session.id);
  },

  // Detalle por id (con totales)
  getSessionDetails: async (id) => {
    return await CashboxModel.computeTotalsForSessionId(id);
  },

  // Movimientos de una sesión
  getSessionMovements: async (id) => {
    return await CashboxModel.listMovementsBySession(id);
  },

  // Histórico por rango
  listSessions: async ({ store_id, from, to }) => {
    const sessions = await CashboxModel.listSessions({ store_id, from, to });
    const result = [];
    for (const s of sessions) {
      const full = await CashboxModel.computeTotalsForSessionId(s.id);
      if (full) result.push(full);
    }
    return result;
  }
};

module.exports = CashboxService;
