// src/models/employee-model.js
const db = require('../config/db');

const USER_TABLE = 'user';
const ROLE_TABLE = 'role';
const SHIFT_TABLE = 'shift';
const STORE_TABLE = 'store';
const USER_SHIFT_STORE_TABLE = 'user_shift_store';
const USER_ROLE_TABLE = 'user_role';

const EmployeeModel = {
  // Obtener usuarios por role_id y luego sus asignaciones
  getUsersByRoleIdWithAssignments: async (employeeRoleId) => {
    try {
      const employeeUsers = await db(USER_TABLE)
        .select(
          `${USER_TABLE}.id as user_id`,
          `${USER_TABLE}.username`,
          `${USER_TABLE}.full_name`,
          `${USER_TABLE}.email`,
          `${USER_TABLE}.avatar`,
          `${USER_TABLE}.status as user_status`,
          `${ROLE_TABLE}.name as role_name`
        )
        .join(USER_ROLE_TABLE, `${USER_TABLE}.id`, '=', `${USER_ROLE_TABLE}.user_id`)
        .join(ROLE_TABLE, `${USER_ROLE_TABLE}.role_id`, '=', `${ROLE_TABLE}.id`)
        .where(`${USER_ROLE_TABLE}.role_id`, employeeRoleId)
        // .whereNull(`${USER_TABLE}.deleted_at`); // Si tienes soft deletes en 'user'

      if (!employeeUsers || employeeUsers.length === 0) {
        return [];
      }

      const employeesWithDetails = await Promise.all(
        employeeUsers.map(async (empUser) => {
          const assignments = await db(USER_SHIFT_STORE_TABLE)
            .select(
              `${STORE_TABLE}.id as store_id`,
              `${STORE_TABLE}.name as store_name`,
              `${SHIFT_TABLE}.id as shift_id`,
              `${SHIFT_TABLE}.name as shift_name` // Usando 'name' de la tabla 'shift'
            )
            .join(STORE_TABLE, `${USER_SHIFT_STORE_TABLE}.store_id`, '=', `${STORE_TABLE}.id`)
            .join(SHIFT_TABLE, `${USER_SHIFT_STORE_TABLE}.shift_id`, '=', `${SHIFT_TABLE}.id`)
            .where(`${USER_SHIFT_STORE_TABLE}.user_id`, empUser.user_id);
          
          const storesMap = new Map();
          assignments.forEach(assign => {
            if (!storesMap.has(assign.store_id)) {
              storesMap.set(assign.store_id, {
                store_id: assign.store_id,
                store_name: assign.store_name,
                shifts: []
              });
            }
            if (assign.shift_id && assign.shift_name) {
                storesMap.get(assign.store_id).shifts.push({
                    shift_id: assign.shift_id,
                    shift_name: assign.shift_name
                });
            }
          });

          return {
            ...empUser,
            assigned_stores_shifts: Array.from(storesMap.values())
          };
        })
      );
      return employeesWithDetails;
    } catch (error) {
      console.error('Error en EmployeeModel.getUsersByRoleIdWithAssignments:', error);
      throw error;
    }
  },

  // Asignar o reasignar turnos a un usuario en una tienda específica
  assignOrUpdateUserShiftsInStore: async (userId, storeId, shiftIds) => {
    return db.transaction(async (trx) => {
      // Eliminar asignaciones existentes para este usuario en esta tienda
      await trx(USER_SHIFT_STORE_TABLE)
        .where({
          user_id: userId,
          store_id: storeId,
        })
        .del();

      // Insertar las nuevas asignaciones si se proveen
      if (shiftIds && shiftIds.length > 0) {
        const assignments = shiftIds.map((shiftId) => ({
          user_id: userId,
          store_id: storeId,
          shift_id: shiftId,
        }));
        await trx(USER_SHIFT_STORE_TABLE).insert(assignments);
      }
      // Podrías retornar algo más significativo si es necesario
      return { message: 'Asignaciones de turnos en tienda actualizadas/creadas.' };
    });
  },
  
  // Eliminar todas las asignaciones de user_shift_store para un usuario.
  clearUserShiftStoreAssignments: async (userId) => {
    return db(USER_SHIFT_STORE_TABLE)
        .where({ user_id: userId })
        .del();
  },

  // (Opcional) Asignar rol a usuario (si no lo hace el user-model)
  assignRoleToUser: async (userId, roleId) => {
    // Verificar si ya existe la asignación para evitar duplicados si la DB no lo previene
    const existing = await db(USER_ROLE_TABLE).where({ user_id: userId, role_id: roleId }).first();
    if (existing) {
        return existing; // O algún indicador de que ya existía
    }
    const [assignment] = await db(USER_ROLE_TABLE).insert({ user_id: userId, role_id: roleId }).returning('*');
    return assignment;
  },

  // (Opcional) Remover rol a usuario
  removeRoleFromUser: async (userId, roleId) => {
    return db(USER_ROLE_TABLE).where({ user_id: userId, role_id: roleId }).del();
  }
};

module.exports = EmployeeModel;