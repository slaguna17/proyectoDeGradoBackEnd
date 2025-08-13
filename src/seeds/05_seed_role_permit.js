exports.seed = async function (knex) {
  await knex('role_permit').del();

  const adminRole = await knex('role').where({ name: 'Administrador' }).first();
  const empleadoRole = await knex('role').where({ name: 'Empleado' }).first();
  const vendedorRole = await knex('role').where({ name: 'Vendedor' }).first();

  const accessAll = await knex('permit').where({ name: 'ACCESS_ALL' }).first();
  const limitedAccess = await knex('permit').where({ name: 'LIMITED_ACCESS' }).first();

  if (!adminRole || !empleadoRole || !vendedorRole || !accessAll || !limitedAccess) {
    throw new Error('❌ No se encontraron roles o permisos necesarios para asignar.');
  }

  await knex('role_permit').insert([
    { role_id: adminRole.id, permit_id: accessAll.id },
    { role_id: empleadoRole.id, permit_id: limitedAccess.id },
    { role_id: vendedorRole.id, permit_id: limitedAccess.id }
  ]);
};
