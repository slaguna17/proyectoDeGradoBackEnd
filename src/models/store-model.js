const db = require('../config/db');

const StoreModel = {
    getStores: async () => {
        return db('store').select('*')
    },
    getStoreById: async (id) => {
        return db('store').where({ id }).first();
    },

    createStore: async (name, address, city, logo, history, phone, socials) => {
        const [newStore] = await db('store').insert({
            name: name,
            address: address,
            city: city,
            logo: logo,
            history: history,
            phone: phone,
            socials: socials
        }).returning('*');

        return newStore
    },

    updateStore: async(id,updateBody) => {
        const updatedStore = await db('store').where({id}).update(updateBody).returning('*')
        return updatedStore[0]
    },
    
    deleteStore: async(id) => {
        return await db('store').where({id}).del();
    }

}

module.exports = StoreModel;