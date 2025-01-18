const db = require('../config/db');

const CategoryModel = {
    getCategories: async () => {
        return db('category').select('*')
    },
    getCategoryById: async (id) => {
        return db('category').where({ id }).first();
    },

    createCategory: async (name, description) => {
        const [newCategory] = await db('category').insert({
            name: name,
            description: description
        }).returning('*');

        return newCategory
    },

    updateCategory: async(id,updateBody) => {
        const updatedCategory = await db('category').where({id}).update(updateBody).returning('*')
        return updatedCategory[0]
    },
    
    deleteCategory: async(id) => {
        return await db('category').where({id}).del();
    }

}

module.exports = CategoryModel;