const FinancialService = require('../services/financial-service');

const FinancialController = {
  getAllMovementsByStore: async (req, res) => {
    try {
      const { storeId } = req.params;
      const movements = await FinancialService.getAllMovementsByStore(storeId);
      res.status(200).json(movements);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener los movimientos financieros.' });
    }
  },

  getIncomeByStore: async (req, res) => {
    try {
      const { storeId } = req.params;
      const movements = await FinancialService.getIncomeByStore(storeId);
      res.status(200).json(movements);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener los ingresos.' });
    }
  },

  getExpensesByStore: async (req, res) => {
    try {
      const { storeId } = req.params;
      const movements = await FinancialService.getExpensesByStore(storeId);
      res.status(200).json(movements);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener los egresos.' });
    }
  }
};

module.exports = FinancialController;