// src/routes/employee-routes.js
const express = require('express');
const router = express.Router();
const EmployeeController = require('../controllers/employee-controller');
const authMiddleware = require('../middleware/auth-middleware');

// GET /api/employees - Listar todos los empleados (usuarios con rol de empleado y sus asignaciones)
router.get('/', EmployeeController.getAllEmployees);

// GET /api/employees/:userId - Obtener detalle de un empleado
router.get('/:userId', EmployeeController.getEmployeeById);

// POST /api/employees - Crear nuevo usuario como empleado O asignar usuario existente como empleado
router.post('/', EmployeeController.createOrAssignEmployee);

// PUT /api/employees/:userId - Actualizar asignaciones de tienda/horarios de un empleado
router.put('/:userId', EmployeeController.updateEmployeeAssignments);

// DELETE /api/employees/:userId - Desasignar empleado (cambiar rol, quitar de user_shift_store)
router.delete('/:userId', EmployeeController.deleteEmployee);

module.exports = router;