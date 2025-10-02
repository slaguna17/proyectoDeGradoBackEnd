const RoleService = require('../services/role-service');

const RoleController = {
    getAllRoles: async (req, res) => {
        try {
            const roles = await RoleService.getAllRoles();
            res.status(200).json(roles);
        } catch (error) {
            console.error("Error en RoleController.getAllRoles:", error.message);
            res.status(500).json({ message: "Server Error, couldn't obtain roles" });
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
        const { name, description, isAdmin } = req.body;

        if (!name || typeof isAdmin !== 'boolean') {
            return res.status(400).json({ error: 'Name and isAdmin fields are required' });
        }
        try {
            const newRole = await RoleService.createRole({ name, description, isAdmin });
            res.status(201).json({ message: 'Role created successfully', role: newRole });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error creating role' });
        }
    },

    updateRole: async (req, res) => {
        const { id } = req.params;
        const { name, description, isAdmin } = req.body;

        if (!name || typeof isAdmin !== 'boolean') {
            return res.status(400).json({ error: 'Missing required fields (name, isAdmin)' });
        }

        try {
            const updated = await RoleService.updateRole(id, { name, description, isAdmin });

            if (updated) {
            res.status(200).json({ message: 'Role updated successfully' });
            } else {
            res.status(404).json({ error: 'Role not found' });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error updating role' });
        }
    },

    deleteRole: async (req, res) => {
        const { id } = req.params;

        try {
            const deleted = await RoleService.deleteRole(id);

            if (deleted) {
                res.status(200).json({ message: 'Role deleted successfully' });
            } else {
                res.status(404).json({ error: 'Role not found' });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error deleting role' });
        }
    },

    //PERMITS
    getPermitsByRole: async (req, res) => {
        const { id } = req.params;
        try {
            const permits = await RoleService.getPermitsByRole(id);
            res.json(permits);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error fetching permits for role' });
        }
    },

    assignPermitsToRole: async (req, res) => {
        const { id } = req.params;
        const { permitIds } = req.body;

        console.log('📥 Params ID:', id);
        console.log('📥 permitIds:', permitIds);

        if (!Array.isArray(permitIds) || permitIds.length === 0) {
            return res.status(400).json({ error: 'Debe enviar un array con los IDs de permisos' });
        }

        try {
            await RoleService.assignPermitsToRole(id, permitIds);
            res.status(200).json({ message: 'Permisos asignados correctamente' });
        } catch (error) {
            console.error('🔥 ERROR en assignPermitsToRole:', error);
            res.status(500).json({ error: 'Error al asignar permisos al rol' });
        }
    }
,

    removeAllPermitsFromRole: async (req, res) => {
        const { id } = req.params;

        try {
            await RoleService.removeAllPermitsFromRole(id);
            res.status(200).json({ message: 'Permisos eliminados correctamente' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al eliminar permisos del rol' });
        }
    }



};

module.exports = RoleController;