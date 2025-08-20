const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/category-controller');

// Rutas REST
// GET    /api/categories?signed=true
router.get('/', CategoryController.getAllCategories);

// GET    /api/categories/:id?signed=true
router.get('/:id', CategoryController.getCategoryById);

// POST   /api/categories
router.post('/', CategoryController.createCategory);

// PUT    /api/categories/:id
router.put('/:id', CategoryController.updateCategory);

// DELETE /api/categories/:id
router.delete('/:id', CategoryController.deleteCategory);

module.exports = router;
