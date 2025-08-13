exports.seed = async function(knex) {
  await knex('role').del();

  await knex('role').insert([
    { name: 'Administrador', description: 'Rol con todos los permisos', isAdmin: true },
    { name: 'Empleado', description: 'Empleado de multiples funciones', isAdmin: false },
    { name: 'Vendedor', description: 'Puede registrar ventas', isAdmin: false },
    { name: 'Limpieza', description: 'Encargado de limpieza', isAdmin: false }
  ]);
};
