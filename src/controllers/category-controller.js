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
        res.status(200).json(category);
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
            const updatedCategory = await CategoryService.updateCategory(req.params.id, req.body);
            res.status(200).json(updatedCategory); // Return 200 with updated category
        } catch (error) {
            console.error(error.message);
            res.status(404).send({ error: "Couldn't update, Category not found" })
        }
    },

    deleteCategory: async(req, res) => {
        try {
            await CategoryService.deleteCategory(req.params.id);
            res.status(200).json({message: "Category deleted successfully"});
        } catch (error) {
            console.error(error.message);
            res.status(404).send({ error: "Couldn't delete, Category not found" })
        }
    }
  };

module.exports = CategoryController;