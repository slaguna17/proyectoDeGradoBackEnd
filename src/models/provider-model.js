const db = require('../config/db');

const ProviderModel = {

    getAllProviders: async () => {
        return await db('provider').select('*');
    },

    getProviderById: async (id) => {
        return db('provider').where({ id }).first();
    },

    createProvider: async ({
        name,
        address,
        phone,
        email,
        contact_person_name,
        notes
        }) => {
        const [provider] = await db('provider')
            .insert({
                name,
                address,
                phone,
                email,
                contact_person_name,
                notes,
                created_at: db.fn.now(),
                updated_at: db.fn.now()
            })
            .returning('*');

        return provider;
    },

    updateProvider: async (id, data) => {
        const updated = await db('provider')
            .where({ id })
            .update({
                ...data,
                updated_at: db.fn.now()
            });
        return updated;
    },
    
   deleteProvider: async (id) => {
        const hasProducts = await db('product')
            .where({ provider_id: id })
            .first();

        if (hasProducts) return 'in_use';

        const deleted = await db('provider')
            .where({ id })
            .del();

        return deleted;
    }


}

module.exports = ProviderModel;