const db = require('../config/db');

const StoreModel = {
    getStores: async () => {
        return db('store').select('*')
    },
    getStoreById: async (id) => {
        return db('store').where({ id }).first();
    },

    createStore: async (storeData) => {
        const [newStore] = await db('store').insert(storeData).returning('*');
        return newStore
    },

    updateStore: async(id,updateBody) => {
        const [updatedStore] = await db('store').where({id}).update(updateBody).returning('*')
        return updatedStore;
    },

    deleteStore: async(id) => {
        const deletedCount = await db('store').where({ id }).del();
        return deletedCount
    }

}

module.exports = StoreModel;