const db = require('../config/db');

const CategoryModel = {
    
  getCategories: async () => {
    return await db('category').select('*');
  },

  getCategoryById: async (id) => {
    return await db('category').where({ id }).first();
  },

  createCategory: async (data) => {
    const [newCategory] = await db('category')
      .insert(data)
      .returning('*');
    return newCategory;
  },

  updateCategory: async (id, data) => {
    const [updated] = await db('category')
      .where({ id })
      .update(data)
      .returning('*');
    return updated;
  },

  deleteCategory: async (id) => {
    return await db('category')
      .where({ id })
      .del();
  }
};

module.exports = CategoryModel;
