exports.seed = async function (knex) {
  await knex('permit').del();

  await knex('permit').insert([
    { name: 'ACCESS_ALL', description: 'Acceso completo al sistema' },
    { name: 'LIMITED_ACCESS', description: 'Acceso limitado: sin empleados, turnos, caja' }
  ]);
};
