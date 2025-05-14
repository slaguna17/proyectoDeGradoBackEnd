// src/services/employee-service.js
const EmployeeModel = require('../models/employee-model');
const UserModel = require('../models/user-model'); // Para crear usuario
const RoleModel = require('../models/role-model'); // Para obtener ID de rol
const db = require('../config/db'); // Para acceso directo si es estrictamente necesario (mejor evitar)

const EMPLOYEE_ROL_NAME = 'Empleado'; // Nombre exacto de tu rol de empleado en la DB

const EmployeeService = {
  _getEmployeeRoleId: async () => {
    const employeeRole = await RoleModel.getRoleByName(EMPLOYEE_ROL_NAME);
    if (!employeeRole) {
      throw new Error(`Rol '${EMPLOYEE_ROL_NAME}' no encontrado. Por favor, crea este rol en la base de datos.`);
    }
    return employeeRole.id;
  },

  getAllEmployeesForUI: async () => {
    try {
      const employeeRoleId = await EmployeeService._getEmployeeRoleId();
      const employeesData = await EmployeeModel.getUsersByRoleIdWithAssignments(employeeRoleId);
      
      return employeesData.map(emp => {
        const primaryStoreAssignment = emp.assigned_stores_shifts.length > 0 ? emp.assigned_stores_shifts[0] : null;

        return {
          userId: emp.user_id,
          username: emp.username,
          fullName: emp.full_name,
          email: emp.email,
          avatarUrl: emp.avatar, // Usando 'avatar' de la tabla 'user'
          status: emp.user_status,
          roleName: emp.role_name,
          assignedStore: primaryStoreAssignment ? 
            { id: primaryStoreAssignment.store_id, name: primaryStoreAssignment.store_name } : 
            { id: -1, name: "No asignada" },
          shifts: primaryStoreAssignment ? 
            primaryStoreAssignment.shifts.map(s => ({ id: s.shift_id, name: s.shift_name })) : 
            [],
          allAssignments: emp.assigned_stores_shifts // Para debugging o lógica más compleja
        };
      });
    } catch (error) {
      console.error('Error en EmployeeService.getAllEmployeesForUI:', error);
      throw new Error('Error al obtener lista de empleados: ' + error.message);
    }
  },

  getEmployeeDetailsForUI: async (userId) => {
    const employeeRoleId = await EmployeeService._getEmployeeRoleId();
    // Obtener usuario y verificar que tenga el rol de empleado
    const empUser = await db('user') // Directamente de la tabla user
        .first(
          `user.id as user_id`,
          `user.username`,
          `user.full_name`,
          `user.email`,
          `user.avatar`,
          `user.status as user_status`,
          `role.name as role_name`
        )
        .join('user_role', `user.id`, '=', `user_role.user_id`)
        .join('role', `user_role.role_id`, '=', `role.id`)
        .where(`user.id`, userId)
        .andWhere(`user_role.role_id`, employeeRoleId);

    if (!empUser) {
        throw new Error('Empleado no encontrado o no tiene el rol correcto.');
    }
    
    const assignments = await db('user_shift_store')
            .select(
              `store.id as store_id`,
              `store.name as store_name`,
              `shift.id as shift_id`,
              `shift.name as shift_name`
            )
            .join('store', `user_shift_store.store_id`, '=', `store.id`)
            .join('shift', `user_shift_store.shift_id`, '=', `shift.id`)
            .where(`user_shift_store.user_id`, empUser.user_id);
    
    const storesMap = new Map();
      assignments.forEach(assign => {
        if (!storesMap.has(assign.store_id)) {
          storesMap.set(assign.store_id, {
            store_id: assign.store_id,
            store_name: assign.store_name,
            shifts: []
          });
        }
        if(assign.shift_id && assign.shift_name){
             storesMap.get(assign.store_id).shifts.push({
                shift_id: assign.shift_id,
                shift_name: assign.shift_name
            });
        }
      });
    const assignedStoresShifts = Array.from(storesMap.values());
    const primaryStoreAssignment = assignedStoresShifts.length > 0 ? assignedStoresShifts[0] : null;

    return {
        userId: empUser.user_id,
        username: empUser.username,
        fullName: empUser.full_name,
        email: empUser.email,
        avatarUrl: empUser.avatar,
        status: empUser.user_status,
        roleName: empUser.role_name,
        assignedStore: primaryStoreAssignment ? 
            { id: primaryStoreAssignment.store_id, name: primaryStoreAssignment.store_name } : 
            { id: -1, name: "No asignada" },
        shifts: primaryStoreAssignment ? 
            primaryStoreAssignment.shifts.map(s => ({ id: s.shift_id, name: s.shift_name })) : 
            [],
        allAssignments: assignedStoresShifts
    };
  },

  createNewUserAndAssignAsEmployee: async (userDataFromController, storeId, shiftIds) => {
    const employeeRoleId = await EmployeeService._getEmployeeRoleId();
    
    // 1. Crear el usuario
    const newUser = await UserModel.createUser({ // UserModel.createUser debe existir y manejar el hashing de contraseña
        username: userDataFromController.username,
        password: userDataFromController.password,
        full_name: userDataFromController.full_name,
        email: userDataFromController.email,
        date_of_birth: userDataFromController.date_of_birth,
        phone: userDataFromController.phone,
        status: userDataFromController.status || "activo",
        avatar: userDataFromController.avatar, // Puede ser null
        last_access: new Date().toISOString() // O gestionado por la DB
    }); 
    if (!newUser || !newUser.id) {
      throw new Error("No se pudo crear el usuario.");
    }

    // 2. Asignar rol de empleado en user_role
    await EmployeeModel.assignRoleToUser(newUser.id, employeeRoleId);
    
    // 3. Asignar a la tienda y turnos en user_shift_store
    await EmployeeModel.assignOrUpdateUserShiftsInStore(newUser.id, storeId, shiftIds);
    return EmployeeService.getEmployeeDetailsForUI(newUser.id);
  },

  assignExistingUserAsEmployee: async (userId, storeId, shiftIds) => {
    const employeeRoleId = await EmployeeService._getEmployeeRoleId();

    // 1. Verificar que el usuario exista
    const user = await UserModel.getUserById(userId); // Asume que UserModel.getUserById existe
    if (!user) {
        throw new Error("Usuario existente no encontrado.");
    }

    // 2. Asignar/Asegurar rol de empleado en user_role
    await EmployeeModel.assignRoleToUser(userId, employeeRoleId);
    
    // 3. Asignar/Actualizar tienda y turnos en user_shift_store
    await EmployeeModel.assignOrUpdateUserShiftsInStore(userId, storeId, shiftIds);
    return EmployeeService.getEmployeeDetailsForUI(userId);
  },

  updateEmployeeAssignments: async (userId, storeId, shiftIds) => {
    const employeeRoleId = await EmployeeService._getEmployeeRoleId();
    const isEmployee = await db(USER_ROLE_TABLE).where({user_id: userId, role_id: employeeRoleId}).first();
    if(!isEmployee) throw new Error("El usuario no es un empleado o no tiene el rol correcto para actualizar asignaciones.");

    await EmployeeModel.assignOrUpdateUserShiftsInStore(userId, storeId, shiftIds);
    return EmployeeService.getEmployeeDetailsForUI(userId);
  },

  deleteEmployeeRoleAndAssignments: async (userId) => {
    const employeeRoleId = await EmployeeService._getEmployeeRoleId();
    // Aquí decides qué rol ponerle. Podría ser un rol "Desactivado" o simplemente quitarle el rol de empleado.
    // Si lo quitas de user_role, ya no aparecerá en la lista de empleados.

    return db.transaction(async trx => {
        await trx(USER_SHIFT_STORE_TABLE) // Usar EmployeeModel sería mejor
            .where({ user_id: userId })
            .del();
        
        const deletedRoleCount = await trx(USER_ROLE_TABLE)
            .where({ user_id: userId, role_id: employeeRoleId })
            .del();

        // Opcional: Cambiar status en tabla 'user'
        // await trx(USER_TABLE).where({ id: userId }).update({ status: 'inactivo_empleado' });

        if (deletedRoleCount === 0) {
            console.warn(`Usuario ${userId} no tenía el rol de empleado para eliminar o ya fue eliminado.`);
        }
        return { message: "Rol de empleado y asignaciones de tienda/turno eliminadas." };
    });
  }
};

module.exports = EmployeeService;