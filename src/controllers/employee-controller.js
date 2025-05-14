// src/controllers/employee-controller.js
const EmployeeService = require('../services/employee-service');
// No necesitas UserModel aquí si toda la creación de usuario se delega al servicio

const EmployeeController = {
  getAllEmployees: async (req, res) => {
    try {
      const employees = await EmployeeService.getAllEmployeesForUI();
      res.status(200).json(employees);
    } catch (error) {
      console.error('Error en EmployeeController.getAllEmployees:', error.message);
      res.status(500).json({ message: "Error del servidor, no se pudieron obtener los Empleados", error: error.message });
    }
  },

  getEmployeeById: async (req, res) => {
    try {
      const userId = parseInt(req.params.userId, 10);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "ID de empleado inválido." });
      }
      const employee = await EmployeeService.getEmployeeDetailsForUI(userId);
      res.status(200).json(employee);
    } catch (error) {
      console.error(`Error en EmployeeController.getEmployeeById (userId: ${req.params.userId}):`, error.message);
      if (error.message.toLowerCase().includes('no encontrado')) {
        res.status(404).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Error del servidor al obtener detalle del empleado.', error: error.message });
      }
    }
  },

  createOrAssignEmployee: async (req, res) => {
    const { 
      isNewUser,
      // Campos para nuevo usuario
      username, // Corresponde a user.username
      password, // contrasena
      full_name, // Corresponde a user.full_name
      email,
      date_of_birth,
      phone,
      status, // Opcional, el servicio puede poner "activo"
      avatar, // Opcional
      // ID de usuario existente
      id_usuario_existente,
      // Datos de asignación
      id_tienda, 
      shifts_ids // array de ids de horario para user_shift_store
    } = req.body;

    try {
      let result;
      if (isNewUser === true) { // Validar explícitamente
        if (!username || !password || !full_name || !email || !date_of_birth || !phone || !id_tienda || !shifts_ids || shifts_ids.length === 0) {
            return res.status(400).json({ message: "Campos requeridos faltantes para crear nuevo empleado: username, password, full_name, email, date_of_birth, phone, id_tienda, shifts_ids."});
        }
        const newUserDetails = { username, password, full_name, email, date_of_birth, phone, status: status || "activo", avatar };
        result = await EmployeeService.createNewUserAndAssignAsEmployee(newUserDetails, id_tienda, shifts_ids);
      } else if (isNewUser === false) {
        if (!id_usuario_existente || !id_tienda || !shifts_ids || shifts_ids.length === 0) {
            return res.status(400).json({ message: "Campos requeridos faltantes para asignar empleado existente: id_usuario_existente, id_tienda, shifts_ids."});
        }
        result = await EmployeeService.assignExistingUserAsEmployee(id_usuario_existente, id_tienda, shifts_ids);
      } else {
        return res.status(400).json({ message: "El campo 'isNewUser' (booleano) es requerido." });
      }
      res.status(201).json({ message: "Operación de empleado completada exitosamente", data: result });
    } catch (error) {
      console.error('Error en EmployeeController.createOrAssignEmployee:', error.message);
      res.status(500).json({ message: "Error en la operación del empleado", error: error.message });
    }
  },

  updateEmployeeAssignments: async (req, res) => {
    const { userId } = req.params;
    const { id_tienda, shifts_ids } = req.body; 

    const parsedUserId = parseInt(userId, 10);
    if (isNaN(parsedUserId)) {
        return res.status(400).json({ message: "ID de empleado inválido." });
    }
    if (!id_tienda || !shifts_ids || !Array.isArray(shifts_ids) || shifts_ids.length === 0) {
        return res.status(400).json({ message: "id_tienda y una lista no vacía de shifts_ids son requeridos." });
    }

    try {
      const result = await EmployeeService.updateEmployeeAssignments(parsedUserId, id_tienda, shifts_ids);
      res.status(200).json({ message: "Asignaciones de empleado actualizadas exitosamente", data: result });
    } catch (error) {
      console.error(`Error en EmployeeController.updateEmployeeAssignments (userId: ${userId}):`, error.message);
       if (error.message.toLowerCase().includes('no encontrado')) {
        res.status(404).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Error al actualizar asignaciones del empleado", error: error.message });
      }
    }
  },

  deleteEmployee: async (req, res) => {
    const { userId } = req.params;
    const parsedUserId = parseInt(userId, 10);
    if (isNaN(parsedUserId)) {
        return res.status(400).json({ message: "ID de empleado inválido." });
    }
    try {
      const result = await EmployeeService.deleteEmployeeRoleAndAssignments(parsedUserId);
      res.status(200).json(result);
    } catch (error) {
      console.error(`Error en EmployeeController.deleteEmployee (userId: ${userId}):`, error.message);
      if (error.message.toLowerCase().includes('no encontrado')) {
        res.status(404).json({ message: error.message });
      } else {
      res.status(500).json({ message: "Error al desasignar empleado", error: error.message });
      }
    }
  }
};

module.exports = EmployeeController;