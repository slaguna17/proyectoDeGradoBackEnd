const CategoryModel = require('../models/category-model');

const CategoryService = {

  getAllCategories: async () => {
    return await CategoryModel.getCategories();
  },

  getCategoryById: async (id) => {
    if (!id) return null;
    return await CategoryModel.getCategoryById(id); // null si no existe
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
    if (!id) return null;
    if (!name) throw new Error('Category name is required');

    // Devuelve el registro actualizado o null si no existe
    return await CategoryModel.updateCategory(id, {
      name,
      description: description || '',
      image,
      updated_at: new Date()
    });
  },

  deleteCategory: async (id) => {
    if (!id) return 0;
    // Devuelve cantidad de filas eliminadas (0 si no existe)
    return await CategoryModel.deleteCategory(id);
  }
};

module.exports = CategoryService;
