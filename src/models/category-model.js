const db = require('../config/db');

const CategoryModel = {
    getCategories: async () => {
        return db('category').select('*')
    },
    getCategoryById: async (id) => {
        return db('category').where({ id }).first();
    },

    createCategory: async (categoryData) => {
        const [newCategory] = await db('category').insert(categoryData).returning('*');
        return newCategory;
    },

    updateCategory: async(id,updateBody) => {
        const [updatedCategory] = await db('category').where({id}).update(updateBody).returning('*')
        return updatedCategory;
    },
    
    deleteCategory: async(id) => {
        const deletedCount = await db('category').where({ id }).del();
        return deletedCount; // Return the number of deleted rows
    }

}

module.exports = CategoryModel;