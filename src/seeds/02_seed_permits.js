// src/seeds/02_seed_permits.js
exports.seed = async function(knex) {
  await knex('permit').del();

//   await knex('permit').insert([
//     { id: 1, name: 'Gestionar Usuarios', description: 'Puede crear, editar y eliminar usuarios' },
//     { id: 2, name: 'Ver Reportes', description: 'Acceso a dashboards de reportes' },
//     { id: 3, name: 'Registrar Ventas', description: 'Permiso para registrar ventas' },
//     { id: 4, name: 'Registrar Compras', description: 'Permiso para registrar compras' }
//   ]);
};
