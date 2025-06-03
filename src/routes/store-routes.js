const express = require('express');
const router = express.Router();
const StoreController = require('../controllers/store-controller');

// CRUD
router.get('/', StoreController.getAllStores);
router.get('/:id', StoreController.getStoreById);
router.post('/createStore', StoreController.createStore);
router.put('/updateStore/:id', StoreController.updateStore);
router.delete('/deleteStore/:id', StoreController.deleteStore); 

module.exports = router;