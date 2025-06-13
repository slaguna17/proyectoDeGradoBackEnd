const db = require('../config/db');

const PermitModel = {
    getAllPermits: async () => {
        return await db('permit').select('*');
    },

    getPermitById: async (id) => {
        return await db('permit').where({ id }).first();
    },

    createPermit: async ({ name, description }) => {
        const [permit] = await db('permit')
            .insert({ name, description, created_at: db.fn.now(), updated_at: db.fn.now() })
            .returning('*');
        return permit;
    },

    updatePermit: async (id, { name, description }) => {
        const [permit] = await db('permit')
            .where({ id })
            .update({ name, description, updated_at: db.fn.now() })
            .returning('*');
        return permit;
    },

    deletePermit: async (id) => {
        await db('permit').where({ id }).del();
    }
};

module.exports = PermitModel;