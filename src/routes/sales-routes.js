const express = require('express');
const router = express.Router();
const SalesController = require('../controllers/sales-controller');

router.post('/createSale', SalesController.registerSale);
router.get('/', SalesController.getAllSales);
router.get('/:id', SalesController.getSaleById);
router.get('/store/:storeId', SalesController.getSalesByStore);
router.get('/user/:userId', SalesController.getSalesByUser);
router.put('/updateSale/:id', SalesController.updateSale);
router.delete('/deleteSale/:id', SalesController.deleteSale);

module.exports = router;
