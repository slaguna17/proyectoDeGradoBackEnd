const express = require('express');
const router = express.Router();
const ProviderController = require('../controllers/provider-controller');

// CRUD
router.get('/', ProviderController.getAllProviders);
router.get('/:id', ProviderController.getProviderById);
router.post('/createProvider', ProviderController.createProvider);
router.put('/updateProvider/:id', ProviderController.updateProvider);
router.delete('/deleteProvider/:id', ProviderController.deleteProvider); 

module.exports = router;