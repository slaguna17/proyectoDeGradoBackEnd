// src/seeds/04_seed_user_roles.js
exports.seed = async function(knex) {
  await knex('user_role').del();

  await knex('user_role').insert([
    { user_id: 1, role_id: 1 }
  ]);
};
