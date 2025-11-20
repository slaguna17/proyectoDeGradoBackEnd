const express = require('express');
const router = express.Router();
const ShoppingCartController = require('../controllers/shopping-cart-controller');

// Base path sugerido: /api/shopping-carts

// 1. Crear carrito (IA Agent)
router.post('/', ShoppingCartController.createCart);

// 2. Obtener pendientes por tienda (Android)
router.get('/store/:storeId', ShoppingCartController.getCartsByStore);

// 3. Actualizar un carrito (Android - Editar items)
router.put('/:id', ShoppingCartController.updateCart);

// 4. Borrar/Cancelar carrito (Android)
router.delete('/:id', ShoppingCartController.deleteCart);

// 5. CONCRETAR VENTA (Android - Botón Cobrar)
router.post('/:id/finalize', ShoppingCartController.finalizeCart);

module.exports = router;