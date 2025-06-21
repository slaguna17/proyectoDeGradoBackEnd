const express = require('express');
const router = express.Router();
const InventoryController = require('../controllers/inventory-controller');

router.get('/:storeId/:productId', InventoryController.getStock);
router.put('/updateStock/:storeId/:productId', InventoryController.updateStock);

module.exports = router;