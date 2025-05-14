// src/models/role-model.js
const db = require('../config/db');
const ROLE_TABLE = 'role'; // Nombre de tabla confirmado

const RoleModel = {
    getAllRoles: async () => {
        return db(ROLE_TABLE).select('*');
    },

    getRoleById: async (id) => {
        return db(ROLE_TABLE).where({ id }).first();
    },

    // Para obtener el rol por nombre, útil para el servicio de empleados
    getRoleByName: async (roleName) => {
        return db(ROLE_TABLE).where({ name: roleName }).first(); // 'name' es la columna correcta
    },

    createRole: async (roleData) => {
        // roleData: { name, description (opcional), isAdmin (opcional, boolean) }
        const { name, description, isAdmin } = roleData;
        const dataToInsert = { name };
        if (description !== undefined) dataToInsert.description = description;
        if (isAdmin !== undefined) dataToInsert.isAdmin = isAdmin;

        const [newRole] = await db(ROLE_TABLE).insert(dataToInsert).returning('*');
        return newRole;
    },

    updateRole: async (id, updateData) => {
        // updateData: { name, description, isAdmin }
        const dataToUpdate = {};
        if (updateData.name !== undefined) dataToUpdate.name = updateData.name;
        if (updateData.description !== undefined) dataToUpdate.description = updateData.description;
        if (updateData.isAdmin !== undefined) dataToUpdate.isAdmin = updateData.isAdmin;
        
        if (Object.keys(dataToUpdate).length === 0) {
            return this.getRoleById(id); // No hay nada que actualizar
        }

        const [updatedRole] = await db(ROLE_TABLE).where({ id }).update(dataToUpdate).returning('*');
        return updatedRole;
    },

    deleteRole: async (id) => {
        // Consideraciones:
        // 1. No permitir eliminar roles esenciales (ej. 'Administrador', 'Empleado') si están protegidos.
        // 2. ¿Qué pasa con user_role y role_permit si se elimina un rol?
        //    Por defecto, si hay FKs con onDelete('RESTRICT') o sin onDelete, la DB podría impedirlo si hay referencias.
        //    Si es onDelete('CASCADE'), se eliminarían las referencias (puede ser peligroso para user_role).
        //    Lo más seguro es verificar primero si el rol está en uso.
        
        // Ejemplo de verificación (a implementar mejor en el servicio):
        // const usersInRole = await db('user_role').where({ role_id: id }).count('* as count').first();
        // if (usersInRole && usersInRole.count > 0) {
        //    throw new Error("No se puede eliminar el rol, está asignado a usuarios.");
        // }
        // const permissionsForRole = await db('role_permit').where({ role_id: id }).count('* as count').first();
        // if (permissionsForRole && permissionsForRole.count > 0) {
        //    throw new Error("No se puede eliminar el rol, tiene permisos asignados.");
        // }

        const deletedCount = await db(ROLE_TABLE).where({ id }).del();
        return deletedCount;
    }
};

module.exports = RoleModel;