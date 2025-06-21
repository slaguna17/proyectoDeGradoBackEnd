const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/category-controller');

// CRUD
router.get('/', CategoryController.getAllCategories);
router.get('/:id', CategoryController.getCategoryById);
router.post('/createCategory', CategoryController.createCategory);
router.put('/updateCategory/:id', CategoryController.updateCategory);
router.delete('/deleteCategory/:id', CategoryController.deleteCategory); 

module.exports = router;