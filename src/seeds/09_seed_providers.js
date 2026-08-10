exports.seed = async function(knex) {
  await knex('provider').del();

  await knex('provider').insert([
    {
      name: 'Distribuidora Norte',
      address: null,
      phone: null,
      email: null,
      contact_person_name: null,
      notes: 'Proveedor de poleras unisex'
    },
    {
      name: 'Mayorista Central',
      address: null,
      phone: null,
      email: null,
      contact_person_name: null,
      notes: 'Proveedor de chaquetas para hombres'
    }
  ]);
};
