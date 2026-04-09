const ReportsService = require('../services/reports-service');

const ReportsController = {
  getSalesSummary: async (req, res) => {
    try {
      const result = await ReportsService.getSalesSummary(req.query);
      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error fetching sales summary report' });
    }
  },

  getSalesDetails: async (req, res) => {
    try {
      const result = await ReportsService.getSalesDetails(req.query);
      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error fetching sales details report' });
    }
  },

  getSalesTopProducts: async (req, res) => {
    try {
      const result = await ReportsService.getSalesTopProducts(req.query);
      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error fetching sales top products report' });
    }
  },

  getPurchasesSummary: async (req, res) => {
    try {
      const result = await ReportsService.getPurchasesSummary(req.query);
      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error fetching purchases summary report' });
    }
  },

  getPurchasesDetails: async (req, res) => {
    try {
      const result = await ReportsService.getPurchasesDetails(req.query);
      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error fetching purchases details report' });
    }
  },

  getPurchasesTopProducts: async (req, res) => {
    try {
      const result = await ReportsService.getPurchasesTopProducts(req.query);
      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error fetching purchases top products report' });
    }
  },

  getPurchasesByProvider: async (req, res) => {
    try {
      const result = await ReportsService.getPurchasesByProvider(req.query);
      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error fetching purchases by provider report' });
    }
  }
};

module.exports = ReportsController;