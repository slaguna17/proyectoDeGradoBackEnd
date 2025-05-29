// src/seeds/03_seed_users.js
exports.seed = async function(knex) {
  await knex('user').del();

  await knex('user').insert([
    {
      username: 'slaguna',
      password: '1',
      full_name: 'Sergio Laguna',
      email: 'slaguna@gmail.com',
      date_of_birth: '01/04/1999',
      phone: '76742300',
      status: 'activo',
      last_access: new Date().toISOString(),
      avatar: null
    }
  ]);
};
