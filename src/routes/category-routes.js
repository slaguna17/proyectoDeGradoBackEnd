const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/category-controller');

// Definir rutas y asignarlas a métodos del controlador

// CRUD
router.get('/', CategoryController.getCategories);
router.get('/:id', CategoryController.getCategoryById);
router.post('/createCategory', CategoryController.createCategory);
router.put('/updateCategory/:id', CategoryController.updateCategory);
router.delete('/deleteCategory/:id', CategoryController.deleteCategory); 

module.exports = router;