// src/routes/role-routes.js
const express = require('express');
const router = express.Router();
const RoleController = require('../controllers/role-controller');
const authMiddleware = require('../middleware/auth-middleware'); // Asumiendo protección

// GET /api/roles - Listar todos los roles
router.get('/', RoleController.getAllRoles);

// GET /api/roles/:id - Obtener un rol por ID
router.get('/:id', RoleController.getRoleById);

// POST /api/roles - Crear un nuevo rol
// Body: { "name": "NombreRol", "description": "Descripción del rol", "isAdmin": false }
router.post('/', RoleController.createRole);

// PUT /api/roles/:id - Actualizar un rol por ID
// Body: { "name": (opcional), "description": (opcional), "isAdmin": (opcional) }
router.put('/:id', RoleController.updateRole);

// DELETE /api/roles/:id - Eliminar un rol por ID
router.delete('/:id', RoleController.deleteRole);

module.exports = router;