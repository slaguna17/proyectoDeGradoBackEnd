const CategoryService = require('../services/category-service');

const CategoryController = {

    //CRUD
    getAllCategories: async (req, res) => {
        try {
            const categories = await CategoryService.getAllCategories();
            res.status(200).json(categories);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error retrieving categories' });
        }
    },

    getCategoryById: async (req, res) => {
        try {
            const category = await CategoryService.getCategoryById(req.params.id);
            if (!category) {
                return res.status(404).json({ error: 'Category not found' });
            }
            res.status(200).json(category);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error retrieving category' });
        }
    },

    createCategory: async (req, res) => {
        const { name, description, image } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Category name is required' });
        }

        try {
            const newCategory = await CategoryService.createCategory({ name, description, image });
            res.status(201).json({ message: 'Category created successfully', category: newCategory });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error creating category' });
        }
    },

    updateCategory: async (req, res) => {
        const { name, description, image } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Category name is required' });
        }

        try {
            const updated = await CategoryService.updateCategory(req.params.id, {
                name,
                description,
                image,
                updated_at: new Date()
            });

            if (updated) {
                res.status(200).json({ message: 'Category updated successfully' });
            } else {
                res.status(404).json({ error: 'Category not found' });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error updating category' });
        }
    },

    deleteCategory: async (req, res) => {
        try {
            const deleted = await CategoryService.deleteCategory(req.params.id);
            if (deleted) {
                res.status(200).json({ message: 'Category deleted successfully' });
            } else {
                res.status(404).json({ error: 'Category not found' });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error deleting category' });
        }
    }
};

module.exports = CategoryController;
