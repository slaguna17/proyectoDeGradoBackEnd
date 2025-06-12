const express = require('express');
const router = express.Router();
const SalesController = require('../controllers/sales-controller');

// CRUD
router.post('/createSale', SalesController.createSale);


module.exports = router;