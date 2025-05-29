// src/seeds/09_seed_providers.js
exports.seed = async function(knex) {
  await knex('provider').del();

  await knex('provider').insert([
    {
      name: 'Distribuidora Norte',
      address: 'Av. 16 de Julio #456',
      phone: '78912345',
      email: 'ventas@norte.com',
      contact_person_name: 'María López',
      notes: 'Entrega semanal'
    },
    {
      name: 'Mayorista Central',
      address: 'Zona Industrial KM8',
      phone: '77441234',
      email: 'contacto@mayorcentral.com',
      contact_person_name: 'Carlos Rojas',
      notes: 'Solo pagos por transferencia'
    }
  ]);
};
