const CategoryModel = require('../models/category-model');

const CategoryService = {
  
  getAllCategories: async () => {
    return await CategoryModel.getCategories();
  },

  getCategoryById: async (id) => {
    if (!id) throw new Error('Category ID is required');

    const category = await CategoryModel.getCategoryById(id);
    if (!category) throw new Error('Category not found');

    return category;
  },

  createCategory: async (data) => {
    const { name, description, image } = data;

    if (!name) throw new Error('Category name is required');

    return await CategoryModel.createCategory({
      name,
      description: description || '',
      image: image || null,
      created_at: new Date(),
      updated_at: new Date()
    });
  },

  updateCategory: async (id, data) => {
    const { name, description, image } = data;

    if (!name) throw new Error('Category name is required');

    const updated = await CategoryModel.updateCategory(id, {
      name,
      description,
      image,
      updated_at: new Date()
    });

    if (!updated) throw new Error('Category not found');

    return updated;
  },

  deleteCategory: async (id) => {
    if (!id) throw new Error('Category ID is required');

    const deletedCount = await CategoryModel.deleteCategory(id);
    if (deletedCount === 0) throw new Error('Category not found');

    return { message: 'Category deleted successfully' };
  }
};

module.exports = CategoryService;
