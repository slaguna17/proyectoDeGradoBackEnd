const express = require('express');
const router = express.Router();
const FinancialController = require('../controllers/financial-controller');

// Obtain all movements from a store
router.get('/movements/store/:storeId', FinancialController.getAllMovementsByStore);

// Obtain income from a single store
router.get('/income/store/:storeId', FinancialController.getIncomeByStore);

// Obtain expenses from a single store
router.get('/expenses/store/:storeId', FinancialController.getExpensesByStore);

module.exports = router;