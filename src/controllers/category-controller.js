const { updateCategory } = require('../models/category-model');
const CategoryService = require('../services/category-service');

const CategoryController = {
    getCategories: async (req,res) => {
        try {
            const categories = await CategoryService.getCategories()
            res.status(200).json(categories);
        } catch (error) {
            console.error(error.message);
            res.status(500).send("Server error, couldn't get Categories")
        }
    },
    getCategoryById: async (req, res) => {
      try {
        const category = await CategoryService.getCategoryById(req.params.id);
        res.status(200).json(category); // Devuelve la respuesta
      } catch (error) {
        console.error(error.message);
        res.status(404).send("Category not found")
      }
    },

    createCategory: async(req,res) => {
        try {
            const newCategory = await CategoryService.createCategory(req.body);
            res.status(201).json(newCategory)
        } catch (error) {
            console.error(error.message);
            res.status(500).send("Server error, couldn't create Category")
        }
    },

    updateCategory: async(req,res) => {
        try {
            const id = req.params.id;
            const updateBody = req.body;

            const updatedCategory = await CategoryService.updateCategory(id, updateBody)
            res.status(201).json(updateCategory)
        } catch (error) {
            console.error(error.message);
            res.status(404).send("Couldn't update, Category not found")
        }
    },

    deleteCategory: async(req, res) => {
        try {
            const id = req.params.id
            const deleteCategory = await CategoryService.deleteCategory(id)
            res.status(200).json(deleteCategory)
        } catch (error) {
            console.error(error.message);
            res.status(404).send("Couldn't delete, Category not found")
        }
    }
  };

module.exports = CategoryController;