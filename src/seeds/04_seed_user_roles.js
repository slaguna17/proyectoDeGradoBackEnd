exports.seed = async function(knex) {
  await knex('user_role').del();

  const admin = await knex('user').select('id').where({ email: 'slaguna@gmail.com' }).first();
  const employee = await knex('user').select('id').where({ email: 'fchavez21@gmail.com' }).first();
  const vendedorUser = await knex('user').select('id').where({ email: 'mrodriguez233@gmail.com' }).first();

  const adminRole = await knex('role').select('id').where({ name: 'Administrador' }).first();
  const employeeRole = await knex('role').select('id').where({ name: 'Empleado' }).first();
  const vendedorRole = await knex('role').select('id').where({ name: 'Vendedor' }).first();

  if (!admin || !employee || !adminRole || !employeeRole) {
    throw new Error('Required users or roles were not found. Check the preceding seeds.');
  }

  const userRoles = [
    // Admin
    { user_id: admin.id, role_id: adminRole.id },
    // Empleado
    { user_id: employee.id, role_id: employeeRole.id }
  ];

  if (vendedorUser && vendedorRole) {
    userRoles.push({ user_id: vendedorUser.id, role_id: vendedorRole.id });
  }

  await knex('user_role').insert(userRoles);
};
