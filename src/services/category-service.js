const CategoryModel = require('../models/category-model');

const CategoryService = {
    getCategories: async () => {
        const categories = await CategoryModel.getCategories();
        return categories;
    },

    getCategoryById: async (id) => {
      if (!id) {
        throw new Error('Category ID is required');
      }
      const category = await CategoryModel.getCategoryById(id);
      if (!category) {
        throw new Error('Category not found');
      }
      return category;
    },

    createCategory: async (categoryData) => {
      return CategoryModel.createCategory(categoryData);
    },

    updateCategory: async (id, updateBody) => {
        const category = await CategoryModel.updateCategory(id, updateBody)
        if(!category){
            throw new Error("Category not found")
        }
        return category; 
    },

    deleteCategory: async (id) => {
        if (!id) {
            throw new Error('Category ID is required');
        }
        const deletedCount = await CategoryModel.deleteCategory(id);
        if (deletedCount === 0) {
            throw new Error('Category not found');
        }
        return { message: "Category deleted successfully" };
    }

  };

module.exports = CategoryService;