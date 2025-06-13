const express = require('express');
const router = express.Router();
const PurchaseController = require('../controllers/purchase-controller');

router.post('/createPurchase', PurchaseController.registerPurchase);
router.get('/', PurchaseController.getAllPurchases);
router.get('/:id', PurchaseController.getPurchaseById);
router.get('/store/:storeId', PurchaseController.getPurchasesByStore);
router.get('/user/:userId', PurchaseController.getPurchasesByUser);
router.get('/provider/:providerId', PurchaseController.getPurchasesByProvider);
router.put('/updatePurchase/:id', PurchaseController.updatePurchase);
router.delete('/deletePurchase/:id', PurchaseController.deletePurchase);

module.exports = router;
