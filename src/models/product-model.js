const db = require('../config/db');

const ProductModel = {
    getProducts: async () => {
        return db('product').select('*')
    },
    getProductById: async (id) => {
        return db('product').where({ id }).first();
    },

    createCategory: async (categoryData) => {
        const [newCategory] = await db('category').insert(categoryData).returning('*');
        return newCategory;
    },

    createProduct: async (productData) => {
        const [newProduct] = await db('product').insert(productData).returning('*');
        return newProduct;
    },

    updateProduct: async(id,updateBody) => {
        const [updatedProduct] = await db('product').where({id}).update(updateBody).returning('*')
        return updatedProduct;
    },
    
    deleteProduct: async(id) => {
        const deletedCount = await db('product').where({id}).del()
        return deletedCount
    },

    getProductsByCategory: async(category_id) => {
        try {
            const products = await db('product').where({ category_id: category_id });
            return products;
        } catch (error) {
            console.error("Error fetching products by category:", error);
            throw error; // Important: re-throw the error
        }
    }

}

module.exports = ProductModel;