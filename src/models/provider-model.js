const db = require('../config/db');

const ProviderModel = {
    getProviders: async () => {
        return db('provider').select('*')
    },
    getProviderById: async (id) => {
        return db('provider').where({ id }).first();
    },

    createProvider: async (providerData) => {
        const [newProvider] = await db('provider').insert(providerData).returning('*');
        return newProvider;
    },

    updateProvider: async(id,updateBody) => {
        const [updatedProvider] = await db('provider').where({id}).update(updateBody).returning('*')
        return updatedProvider;
    },
    
    deleteProvider: async(id) => {
        const deletedCount = await db('provider').where({ id }).del();
        return deletedCount;
    }

}

module.exports = ProviderModel;