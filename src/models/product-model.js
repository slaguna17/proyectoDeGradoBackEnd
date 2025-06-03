const db = require('../config/db');

const ProductModel = {

    getAllProductsWithRelations: async () => {
        const products = await db('product').select('*');

        for (const product of products) {
            const stores = await db('store_product')
            .join('store', 'store_product.store_id', 'store.id')
            .where('store_product.product_id', product.id)
            .select('store.id', 'store.name');

            const providers = await db('provider_product')
            .join('provider', 'provider_product.provider_id', 'provider.id')
            .where('provider_product.product_id', product.id)
            .select('provider.id', 'provider.name');

            product.stores = stores;
            product.providers = providers;
        }

        return products;
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

    updateProduct: async (id, data) => {
        const updated = await db('product')
            .where({ id })
            .update({
                ...data,
                updated_at: db.fn.now()
            });
        return updated;
    },
    
    deleteProduct: async (id) => {
        const usedInSales = await db('sales_product')
            .where({ product_id: id })
            .first();

        const usedInPurchases = await db('purchase_product')
            .where({ product_id: id })
            .first();

        if (usedInSales || usedInPurchases) return 'in_use';

        await db('store_product').where({ product_id: id }).del();
        await db('provider_product').where({ product_id: id }).del();

        const deleted = await db('product').where({ id }).del();
        return deleted;
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
    },

    assignRelations: async (productId, storeIds = [], providerIds = []) => {
        if (storeIds.length > 0) {
            const storeData = storeIds.map(storeId => ({
            product_id: productId,
            store_id: storeId
            }));
            await db('store_product').insert(storeData);
        }

        if (providerIds.length > 0) {
            const providerData = providerIds.map(providerId => ({
            product_id: productId,
            provider_id: providerId
            }));
            await db('provider_product').insert(providerData);
        }

        return true;
    }

}

module.exports = ProductModel;