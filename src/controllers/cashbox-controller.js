// src/controllers/cashbox-controller.js
const CashboxService = require('../services/cashbox-service');

const CashboxController = {
  // POST /api/cashbox/open
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

  // POST /api/cashbox/close
  closeCashbox: async (req, res) => {
    try {
      const summary = await CashboxService.closeCashbox(req.body);
      res.status(200).json({ message: 'Cashbox closed successfully', summary });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error closing cash box' });
    }
  },

  // POST /api/cashbox/movements
  createMovement: async (req, res) => {
    try {
      const movement = await CashboxService.createMovement(req.body);
      res.status(201).json({ message: 'Movement saved', movement });
    } catch (err) {
      console.error(err);
      const status = err.status || 500;
      res.status(status).json({ error: err.message || 'Error creating movement' });
    }
  },

  // GET /api/cashbox/current/:storeId
  current: async (req, res) => {
    try {
      const data = await CashboxService.getCurrent(Number(req.params.storeId));
      if (!data) return res.status(204).send();
      res.json({ session: data.session, totals: data });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error fetching current cashbox' });
    }
  },

  // GET /api/cashbox/sessions?store_id=&from=&to=
  listSessions: async (req, res) => {
    try {
      const { store_id, from, to } = req.query;
      if (!store_id) return res.status(400).json({ error: 'store_id is required' });
      const sessions = await CashboxService.listSessions({ store_id: Number(store_id), from, to });
      res.json({ sessions });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error listing sessions' });
    }
  },

  // GET /api/cashbox/sessions/:id
  getSession: async (req, res) => {
    try {
      const data = await CashboxService.getSessionDetails(Number(req.params.id));
      if (!data) return res.status(404).json({ error: 'Cash session not found' });
      res.json({ session: data.session, totals: data });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error fetching session' });
    }
  },

  // GET /api/cashbox/sessions/:id/movements
  getSessionMovements: async (req, res) => {
    try {
      const movements = await CashboxService.getSessionMovements(Number(req.params.id));
      res.json({ movements });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error fetching session movements' });
    }
  }
};

module.exports = CashboxController;
