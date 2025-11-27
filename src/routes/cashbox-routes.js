const express = require('express');
const router = express.Router();
const CashboxController = require('../controllers/cashbox-controller');

// POST
router.post('/open', CashboxController.openCashbox);
router.post('/close', CashboxController.closeCashbox);
router.post('/movements', CashboxController.createMovement);

// GET
router.get('/current/:storeId', CashboxController.current);
router.get('/sessions', CashboxController.listSessions);
router.get('/sessions/:id', CashboxController.getSession);
router.get('/sessions/:id/movements', CashboxController.getSessionMovements);

module.exports = router;
