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
        const tablesToCheck = [
            ['user_shift_store', 'store_id'],
            ['store_product', 'store_id'],
            ['sales', 'store_id'],
            ['purchase', 'store_id'],
            ['sales_box', 'store_id'],
            ['purchase_box', 'store_id'],
            ['cash_summary', 'store_id']
        ];

        for (const [table, field] of tablesToCheck) {
            const exists = await db(table).where(field, id).first();
            if (exists) return 'in_use';
        }

        const deleted = await db('store').where({ id }).del();
        return deleted;
    }
};

module.exports = StoreModel;
