const express = require('express');
const router = express.Router();
const ReportsController = require('../controllers/reports-controller');

// Sales reports
router.get('/sales/summary', ReportsController.getSalesSummary);
router.get('/sales/details', ReportsController.getSalesDetails);
router.get('/sales/top-products', ReportsController.getSalesTopProducts);

// Purchase reports
router.get('/purchases/summary', ReportsController.getPurchasesSummary);
router.get('/purchases/details', ReportsController.getPurchasesDetails);
router.get('/purchases/top-products', ReportsController.getPurchasesTopProducts);
router.get('/purchases/by-provider', ReportsController.getPurchasesByProvider);

module.exports = router;