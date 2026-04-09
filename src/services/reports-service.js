const ReportsModel = require('../models/reports-model');

const ReportsService = {
  getSalesSummary: async (filters) => {
    return await ReportsModel.getSalesSummary(filters);
  },

  getSalesDetails: async (filters) => {
    return await ReportsModel.getSalesDetails(filters);
  },

  getSalesTopProducts: async (filters) => {
    return await ReportsModel.getSalesTopProducts(filters);
  },

  getPurchasesSummary: async (filters) => {
    return await ReportsModel.getPurchasesSummary(filters);
  },

  getPurchasesDetails: async (filters) => {
    return await ReportsModel.getPurchasesDetails(filters);
  },

  getPurchasesTopProducts: async (filters) => {
    return await ReportsModel.getPurchasesTopProducts(filters);
  },

  getPurchasesByProvider: async (filters) => {
    return await ReportsModel.getPurchasesByProvider(filters);
  }
};

module.exports = ReportsService;