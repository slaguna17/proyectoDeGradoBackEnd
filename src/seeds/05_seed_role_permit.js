// src/seeds/05_seed_role_permit.js
exports.seed = async function(knex) {
  await knex('role_permit').del();

  // await knex('role_permit').insert([
  //   { id: 1, role_id: 1, permit_id: 1 },
  //   { id: 2, role_id: 1, permit_id: 2 },
  //   { id: 3, role_id: 1, permit_id: 3 },
  //   { id: 4, role_id: 1, permit_id: 4 },
  //   { id: 5, role_id: 2, permit_id: 3 },
  //   { id: 6, role_id: 3, permit_id: 4 }
  // ]);
};
