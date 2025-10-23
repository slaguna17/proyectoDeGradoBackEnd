const FinancialService = require('../services/financial-service');

const FinancialController = {
  /**
   * GET /api/financials/movements/store/:storeId
   * Obtiene todos los movimientos financieros de una tienda.
   */
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

  /**
   * GET /api/financials/income/store/:storeId
   * Obtiene todos los ingresos de una tienda.
   */
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

  /**
   * GET /api/financials/expenses/store/:storeId
   * Obtiene todos los egresos de una tienda.
   */
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