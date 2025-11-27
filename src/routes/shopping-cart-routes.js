const express = require('express');
const router = express.Router();
const ShoppingCartController = require('../controllers/shopping-cart-controller');

// CRUD
router.post('/', ShoppingCartController.createCart);
router.get('/store/:storeId', ShoppingCartController.getCartsByStore);
router.put('/:id', ShoppingCartController.updateCart);
router.delete('/:id', ShoppingCartController.deleteCart);

// FINALIZE SALE
router.post('/:id/finalize', ShoppingCartController.finalizeCart);

module.exports = router;