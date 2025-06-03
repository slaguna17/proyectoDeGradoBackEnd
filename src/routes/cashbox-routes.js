const express = require('express');
const router = express.Router();
const CashboxController = require('../controllers/cashbox-controller');

router.post('/open', CashboxController.openCashbox);

module.exports = router;
