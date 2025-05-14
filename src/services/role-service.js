// src/services/role-service.js
const RoleModel = require('../models/role-model');
const db = require('../config/db'); // Para verificar si el rol está en uso

const USER_ROLE_TABLE = 'user_role'; // Asumiendo que esta tabla existe

const RoleService = {
    getAllRoles: async () => {
        try {
            return await RoleModel.getAllRoles();
        } catch (error) {
            console.error("Error en RoleService.getAllRoles:", error);
            throw new Error("Error al obtener roles.");
        }
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
            // console.error(`Error en RoleService.getRoleById (id: ${id}):`, error); // Ya se loggea en el modelo
            if (error.message.includes('no encontrado')) throw error;
            throw new Error("Error al obtener el rol.");
        }
    },

    createRole: async (roleData) => {
        if (!roleData.name) {
            throw new Error("El nombre del rol es requerido.");
        }
        try {
            // Verificar si ya existe un rol con ese nombre
            const existingRole = await RoleModel.getRoleByName(roleData.name);
            if (existingRole) {
                throw new Error("Un rol con ese nombre ya existe.");
            }
            return await RoleModel.createRole(roleData);
        } catch (error) {
            // console.error("Error en RoleService.createRole:", error); // Ya se loggea en el modelo
            if (error.message.includes('ya existe')) throw error;
            throw new Error("Error al crear el rol.");
        }
    },

    updateRole: async (id, updateData) => {
        if (!id) {
            throw new Error('ID del rol es requerido para actualizar.');
        }
        if (Object.keys(updateData).length === 0) {
             throw new Error("No hay datos para actualizar.");
        }
        if (updateData.name) {
            const existingRole = await RoleModel.getRoleByName(updateData.name);
            if (existingRole && existingRole.id !== parseInt(id)) { // Asegurar que id sea número si es string
                throw new Error("Un rol con ese nombre ya existe.");
            }
        }
        try {
            const updatedRole = await RoleModel.updateRole(id, updateData);
            if (!updatedRole) {
                throw new Error('Rol no encontrado para actualizar.');
            }
            return updatedRole;
        } catch (error) {
            // console.error(`Error en RoleService.updateRole (id: ${id}):`, error);
            if (error.message.includes('no encontrado') || error.message.includes('ya existe')) throw error;
            throw new Error("Error al actualizar el rol.");
        }
    },

    deleteRole: async (id) => {
        if (!id) {
            throw new Error('ID del rol es requerido para eliminar.');
        }
        try {
            // Verificar si el rol está asignado a algún usuario
            const usersWithRole = await db(USER_ROLE_TABLE) // ASUNCIÓN: user_role existe
                                     .where({ role_id: id })
                                     .count('* as count')
                                     .first();
            if (usersWithRole && parseInt(usersWithRole.count, 10) > 0) {
               throw new Error("No se puede eliminar el rol porque está asignado a uno o más usuarios. Reasigne los usuarios a otro rol primero.");
            }

            // Podrías añadir verificación similar para role_permit si es necesario

            const deletedCount = await RoleModel.deleteRole(id);
            if (deletedCount === 0) {
                throw new Error('Rol no encontrado para eliminar.');
            }
            return { message: "Rol eliminado exitosamente." };
        } catch (error) {
            // console.error(`Error en RoleService.deleteRole (id: ${id}):`, error);
            if (error.message.includes('no encontrado') || error.message.includes('No se puede eliminar') || error.message.includes('requerido')) throw error;
            throw new Error("Error al eliminar el rol.");
        }
    }
};

module.exports = RoleService;