const CashboxService = require('../services/cashbox-service');

const CashboxController = {
  openCashbox: async (req, res) => {
    const { store_id, opening_amount } = req.body;

    if (!store_id || opening_amount == null) {
      return res.status(400).json({ error: 'store_id and opening_amount are required' });
    }

    try {
      const result = await CashboxService.openCashbox(store_id, opening_amount);

      if (result === 'already_open') {
        return res.status(400).json({ error: 'Cashbox already open for this store today' });
      }

      res.status(201).json({ message: 'Cashbox opened successfully', cashbox: result });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error opening cashbox' });
    }
  },

  closeCashbox: async (req, res) => {
    try {
      const summary = await CashboxService.closeCashbox(req.body);
      res.status(200).json({ message: "Cashbox closed successfully", summary });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error closing cash box" });
    }
  }

};
module.exports = CashboxController;