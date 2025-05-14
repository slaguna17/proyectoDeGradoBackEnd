// src/controllers/role-controller.js
const RoleService = require('../services/role-service');

const RoleController = {
    getAllRoles: async (req, res) => {
        try {
            const roles = await RoleService.getAllRoles();
            res.status(200).json(roles);
        } catch (error) {
            console.error("Error en RoleController.getAllRoles:", error.message);
            res.status(500).json({ message: "Error del servidor, no se pudieron obtener los roles." });
        }
    },

    getRoleById: async (req, res) => {
        try {
            const roleId = parseInt(req.params.id, 10);
            if (isNaN(roleId)) {
                return res.status(400).json({ message: "ID de rol inválido." });
            }
            const role = await RoleService.getRoleById(roleId);
            res.status(200).json(role);
        } catch (error) {
            console.error(`Error en RoleController.getRoleById (id: ${req.params.id}):`, error.message);
            if (error.message.toLowerCase().includes('no encontrado') || error.message.toLowerCase().includes('requerido')) {
                res.status(404).json({ message: error.message });
            } else {
                res.status(500).json({ message: "Error del servidor al obtener el rol." });
            }
        }
    },

    createRole: async (req, res) => {
        try {
            const newRole = await RoleService.createRole(req.body);
            res.status(201).json(newRole);
        } catch (error) {
            console.error("Error en RoleController.createRole:", error.message);
             if (error.message.toLowerCase().includes('ya existe') || error.message.toLowerCase().includes('requerido')) {
                res.status(400).json({ message: error.message });
            } else {
                res.status(500).json({ message: "Error del servidor, no se pudo crear el rol." });
            }
        }
    },

    updateRole: async (req, res) => {
        try {
            const roleId = parseInt(req.params.id, 10);
            if (isNaN(roleId)) {
                return res.status(400).json({ message: "ID de rol inválido." });
            }
            const updatedRole = await RoleService.updateRole(roleId, req.body);
            res.status(200).json(updatedRole);
        } catch (error) {
            console.error(`Error en RoleController.updateRole (id: ${req.params.id}):`, error.message);
            if (error.message.toLowerCase().includes('no encontrado') || error.message.toLowerCase().includes('requerido') || error.message.toLowerCase().includes('ya existe')) {
                res.status(400).json({ message: error.message }); // 404 si no encontrado, 400 si datos invalidos
            } else {
                res.status(500).json({ message: "Error del servidor al actualizar el rol." });
            }
        }
    },

    deleteRole: async (req, res) => {
        try {
            const roleId = parseInt(req.params.id, 10);
            if (isNaN(roleId)) {
                return res.status(400).json({ message: "ID de rol inválido." });
            }
            const result = await RoleService.deleteRole(roleId);
            res.status(200).json(result); // Devuelve { message: "..." }
        } catch (error) {
            console.error(`Error en RoleController.deleteRole (id: ${req.params.id}):`, error.message);
             if (error.message.toLowerCase().includes('no encontrado') || error.message.toLowerCase().includes('requerido') || error.message.toLowerCase().includes('no se puede eliminar')) {
                res.status(400).json({ message: error.message }); // 404 si no encontrado, 400 si no se puede eliminar
            } else {
                res.status(500).json({ message: "Error del servidor al eliminar el rol." });
            }
        }
    }
};

module.exports = RoleController;