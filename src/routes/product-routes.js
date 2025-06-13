const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/product-controller');

// CRUD
router.get('/', ProductController.getAllProducts);
router.get('/:id', ProductController.getProductById);
router.post('/createProduct', ProductController.createProduct);
router.put('/updateProduct/:id', ProductController.updateProduct);
router.delete('/deleteProduct/:id', ProductController.deleteProduct);

// Relations
router.get('/categories/:category_id', ProductController.getProductsByCategory);
router.get('/stores/:storeId', ProductController.getProductsByStore);
router.get('/:categoryId/store/:storeId', ProductController.getProductsByCategoryAndStore);
router.post('/assign/:id', ProductController.assignRelations);

module.exports = router;