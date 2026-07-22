exports.seed = async function(knex) {
  await knex('user_role').del();

  const admin = await knex('user').select('id').where({ email: 'slaguna@gmail.com' }).first();
  const employee = await knex('user').select('id').where({ email: 'jperez@gmail.com' }).first();
  const adminRole = await knex('role').select('id').where({ name: 'Administrador' }).first();
  const employeeRole = await knex('role').select('id').where({ name: 'Empleado' }).first();

  if (!admin || !employee || !adminRole || !employeeRole) {
    throw new Error('Required users or roles were not found. Check the preceding seeds.');
  }

  await knex('user_role').insert([
    //Admin
    { user_id: admin.id, role_id: adminRole.id },
    
    //Regular user
    { user_id: employee.id, role_id: employeeRole.id }
  ]);
};
