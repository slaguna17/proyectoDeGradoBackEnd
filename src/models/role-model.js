// src/models/role-model.js
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
        try {
            // Consulta los permisos ya asignados
            const existing = await db('role_permit')
            .where({ role_id: roleId })
            .pluck('permit_id');

            // Filtra solo los que no estén asignados
            const newPermits = permitIds.filter(pid => !existing.includes(pid));

            if (newPermits.length === 0) return { message: 'No new permits to assign' };

            const inserts = newPermits.map(permitId => ({
                role_id: roleId,
                permit_id: permitId
            }));

            return await db('role_permit').insert(inserts);
        } catch (error) {
            console.error('🔥 SQL ERROR - assignPermitsToRole:', error);
            throw error;
        }
    },

    removeAllPermitsFromRole: async (roleId) => {
        return await db('role_permit')
            .where({ role_id: roleId })
            .del();
    }


};

module.exports = RoleModel;