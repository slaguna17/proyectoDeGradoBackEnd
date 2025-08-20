const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/product-controller');

router.get('/categories/:categoryId/stores/:storeId', ProductController.getProductsByCategoryAndStore);
router.get('/categories/:category_id', ProductController.getProductsByCategory);
router.get('/stores/:storeId', ProductController.getProductsByStore);

// CRUD
router.get('/', ProductController.getAllProducts);
router.post('/createProduct', ProductController.createProduct);
router.put('/updateProduct/:id', ProductController.updateProduct);
router.delete('/deleteProduct/:id', ProductController.deleteProduct);
router.get('/:id', ProductController.getProductById);

// Assigning
router.post('/assign/:id', ProductController.assignRelations);

module.exports = router;
