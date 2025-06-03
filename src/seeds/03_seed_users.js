// src/seeds/03_seed_users.js
const bcrypt = require('bcrypt');

exports.seed = async function(knex) {
  await knex('user').del();

  const hashedPassword = await bcrypt.hash('1', 10);

  await knex('user').insert([
    {
      username: 'slaguna',
      password: hashedPassword,
      full_name: 'Sergio Laguna',
      email: 'slaguna@gmail.com',
      date_of_birth: '1999-04-01',
      phone: '76742300',
      status: 'ACTIVE',
      last_access: new Date().toISOString(),
      avatar: null
    }
  ]);
};
