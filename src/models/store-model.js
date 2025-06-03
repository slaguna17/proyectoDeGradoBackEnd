const db = require('../config/db');

const StoreModel = {
    getAllStores: async () => {
        return await db('store').select('*');
    },
    getStoreById: async (id) => {
        return db('store').where({ id }).first();
    },

    createStore: async ({ name, address, city, logo, history, phone }) => {
        const [store] = await db('store')
            .insert({
                name,
                address,
                city,
                logo,
                history,
                phone,
                created_at: db.fn.now(),
                updated_at: db.fn.now()
            })
            .returning('*');

        return store;
    },

    updateStore: async (id, data) => {
        const updated = await db('store')
            .where({ id })
            .update({
                ...data,
                updated_at: db.fn.now()
            });

        return updated;
    },

    deleteStore: async (id) => {
        const hasEmployees = await db('user_shift_store').where({ store_id: id }).first();
        const hasProducts = await db('product').where({ store_id: id }).first();
        const hasProviders = await db('provider').where({ store_id: id }).first();

        if (hasEmployees || hasProducts || hasProviders) return 'in_use';

        const deleted = await db('store').where({ id }).del();
        return deleted;
    }


}

module.exports = StoreModel;