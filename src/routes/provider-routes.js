const express = require('express');
const router = express.Router();
const ProviderController = require('../controllers/provider-controller');

// Relations: provider <-> product
router.get('/:id/products', ProviderController.getProductsByProvider);
router.post('/:id/products/:productId', ProviderController.assignProduct);
router.put('/:id/products', ProviderController.syncProducts);
router.delete('/:id/products/:productId', ProviderController.removeProduct);

// CRUD
router.get('/', ProviderController.getAllProviders);
router.get('/:id', ProviderController.getProviderById);
router.post('/createProvider', ProviderController.createProvider);
router.put('/updateProvider/:id', ProviderController.updateProvider);
router.delete('/deleteProvider/:id', ProviderController.deleteProvider);

module.exports = router;