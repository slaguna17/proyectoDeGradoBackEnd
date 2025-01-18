const db = require('../config/db');

const ProductModel = {
    getProducts: async () => {
        return db('product').select('*')
    },
    getProductById: async (id) => {
        return db('product').where({ id }).first();
    },

    createProduct: async (SKU, name, description, image, brand, category_id) => {
        const [newProduct] = await db('product').insert({
            SKU: SKU,
            name: name,
            description: description,
            image: image,
            brand: brand,
            category_id: category_id,
        }).returning('*');

        return newProduct
    },

    updateProduct: async(id,updateBody) => {
        const updatedProduct = await db('product').where({id}).update(updateBody).returning('*')
        return updatedProduct[0]
    },
    
    deleteProduct: async(id) => {
        return await db('product').where({id}).del();
    }

}

module.exports = ProductModel;