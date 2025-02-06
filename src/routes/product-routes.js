const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/product-controller');

// Definir rutas y asignarlas a métodos del controlador

// CRUD
router.get('/', ProductController.getProducts);
router.get('/:id', ProductController.getProductById);
router.post('/createProduct', ProductController.createProduct);
router.put('/updateProduct/:id', ProductController.updateProduct);
router.delete('/deleteProduct/:id', ProductController.deleteProduct); 

// Other methods
router.get('/categories/:category_id', ProductController.getProductsByCategory);
router.get('/stores/:storeId', ProductController.getProductsByStore)


module.exports = router;