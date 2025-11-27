const db = require('../config/db');

const RoleModel = {
    getAllRoles: async () => {
        return await db('role').select('*');
    },

    getRoleById: async (id) => {
        return db('role').where({ id }).first();
    },

    getRoleByName: async (roleName) => {
        return db('role').where({ name: roleName }).first();
    },

    createRole: async ({ name, description, isAdmin }) => {
        const [newRole] = await db('role')
            .insert({ name, description, isAdmin })
            .returning(['id', 'name', 'description', 'isAdmin']);
        return newRole;
    },

    updateRole: async (id, data) => {
        return await db('role')
            .where({ id })
            .update({
                ...data,
                updated_at: db.fn.now()
            });
    },

    deleteRole: async (id) => {
        return await db('role')
            .where({ id })
            .del();
    },

    //PERMITS
    getPermitsByRole: async (roleId) => {
        return await db('role_permit')
            .join('permit', 'role_permit.permit_id', 'permit.id')
            .where('role_permit.role_id', roleId)
            .select('permit.id', 'permit.name', 'permit.description');
    },

    assignPermitsToRole: async (roleId, permitIds) => {
        // Transaction for both delete and insert to be completed in a safe way, otherwise, it does nothing
        return db.transaction(async (trx) => {
            await trx('role_permit')
                .where({ role_id: roleId })
                .del();

            if (permitIds && permitIds.length > 0) {
                const inserts = permitIds.map(permitId => ({
                    role_id: roleId,
                    permit_id: permitId
                }));
                await trx('role_permit').insert(inserts);
            }
        });
    },

    removeAllPermitsFromRole: async (roleId) => {
        return await db('role_permit')
            .where({ role_id: roleId })
            .del();
    }


};

module.exports = RoleModel;