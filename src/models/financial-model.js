const db = require('../config/db');

const FinancialModel = {
  getAllMovementsByStore: async (storeId) => {
    return db('cash_movement')
      .where({ store_id: storeId })
      .orderBy('created_at', 'desc');
  },

  getIncomeByStore: async (storeId) => {
    return db('cash_movement')
      .where({ store_id: storeId, direction: 'IN' })
      .orderBy('created_at', 'desc');
  },

  getExpensesByStore: async (storeId) => {
    return db('cash_movement')
      .where({ store_id: storeId, direction: 'OUT' })
      .orderBy('created_at', 'desc');
  }
};

module.exports = FinancialModel;