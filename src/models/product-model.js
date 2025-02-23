const db = require('../config/db');

const ProductModel = {
    getProducts: async () => {
        return db('product').select('*')
    },
    getProductById: async (id) => {
        return db('product').where({ id }).first();
    },

    createProduct: async (productData, storeData) => {
        try {
            return await db.transaction(async (trx) => {
                //Verify if Store exists
                const storeExists = await trx('store')
                .where('id', storeData.store_id)
                .first();

                if (!storeExists) {
                    throw new Error(`The store with ID ${storeData.store_id} doesn't exist.`);
                }
                // Insert into product
                const [newProduct] = await trx('product')
                    .insert(productData)
                    .returning('*');
                // Insert into store_product
                await trx('store_product').insert({
                    store_id: storeData.store_id,
                    product_id: newProduct.id,
                    stock: storeData.stock,
                    expiration_date: storeData.expiration_date
                });
                // Return created product
                return newProduct;
            });
        } catch (error) {
            console.error('Error creating product:', error.message);
            throw error;
        }
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
            console.error("Error fetching products by category: ", error);
            throw error; // Important: re-throw the error
        }
    },

    getProductsByStore: async (storeId) => {
        try {
            const products = await db('store_product AS sp')
                .join('product AS p', 'sp.product_id', 'p.id')
                .where('sp.store_id', storeId)
                .select(
                    'p.id',
                    'p.SKU',
                    'p.name',
                    'p.description',
                    'p.image',
                    'p.category_id',
                    'p.brand',
                    'sp.stock',
                    'sp.expiration_date'
                );

            return products;
        } catch (error) {
            console.error('Error fetching products by store: ', error.message);
            throw error;
        }
    },

    getProductsByStore: async (storeId) => {
        try {
            const products = await db('store_product AS sp')
                .join('product AS p', 'sp.product_id', 'p.id')
                .where('sp.store_id', storeId)
                .select(
                    'p.id',
                    'p.SKU',
                    'p.name',
                    'p.description',
                    'p.image',
                    'p.category_id',
                    'p.brand',
                    'sp.stock',
                    'sp.expiration_date'
                );

            return products;
        } catch (error) {
            console.error('Error fetching products by store: ', error.message);
            throw error;
        }
    },

    getProductsByCategoryAndStore: async (categoryId, storeId) => {
        try {
            const products = await db('store_product')
            .join('product', 'store_product.product_id', 'product.id')
            .where('store_product.store_id', storeId)
            .andWhere('product.category_id', categoryId)
            .select('product.*', 'store_product.stock', 'store_product.expiration_date');

            return products
        } catch (error) {
            console.error('Error fetching products by category and store: ', error.message);
            throw error;
        }    
    }

}

module.exports = ProductModel;