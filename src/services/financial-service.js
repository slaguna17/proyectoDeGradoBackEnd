const FinancialModel = require('../models/financial-model');

const FinancialService = {
  getAllMovementsByStore: async (storeId) => {
    if (!storeId) throw new Error('El ID de la tienda es requerido.');
    return await FinancialModel.getAllMovementsByStore(storeId);
  },

  getIncomeByStore: async (storeId) => {
    if (!storeId) throw new Error('El ID de la tienda es requerido.');
    return await FinancialModel.getIncomeByStore(storeId);
  },

  getExpensesByStore: async (storeId) => {
    if (!storeId) throw new Error('El ID de la tienda es requerido.');
    return await FinancialModel.getExpensesByStore(storeId);
  }
};

module.exports = FinancialService;