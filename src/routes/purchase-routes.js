const express = require('express');
const router = express.Router();
const PurchaseController = require('../controllers/purchase-controller');

router.post('/createPurchase', PurchaseController.registerPurchase);

module.exports = router;
