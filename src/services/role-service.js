const RoleModel = require('../models/role-model');
const db = require('../config/db'); 
const USER_ROLE_TABLE = 'user_role';
const RoleService = {

    getAllRoles: async () => {
        return await RoleModel.getAllRoles();
    },

    getRoleById: async (id) => {
        if (!id) {
            throw new Error('ID del rol es requerido.');
        }
        try {
            const role = await RoleModel.getRoleById(id);
            if (!role) {
                throw new Error('Rol no encontrado.');
            }
            return role;
        } catch (error) {
            if (error.message.includes('no encontrado')) throw error;
            throw new Error("Error al obtener el rol.");
        }
    },

    createRole: async (data) => {
        return await RoleModel.createRole(data);
    },

    updateRole: async (id, data) => {
        return await RoleModel.updateRole(id, data);
    },

    deleteRole: async (id) => {
        await RoleModel.removeAllPermitsFromRole(id);
        return await RoleModel.deleteRole(id);
    },

    //PERMITS
    getPermitsByRole: async (roleId) => {
        return await RoleModel.getPermitsByRole(roleId);
    },

    assignPermitsToRole: async (roleId, permitIds) => {
        return await RoleModel.assignPermitsToRole(roleId, permitIds);
    },

    removeAllPermitsFromRole: async (roleId) => {
        return await RoleModel.removeAllPermitsFromRole(roleId);
    }


};

module.exports = RoleService;