const bcrypt = require('bcrypt');

exports.seed = async function(knex) {
  await knex('user').del();

  const defaultPassword = await bcrypt.hash('1', 10);

  await knex('user').insert([
    // Admin
    {
      username: 'slaguna',
      password: defaultPassword,
      full_name: 'Sergio Laguna',
      email: 'slaguna@gmail.com',
      date_of_birth: '1999-04-01',
      phone: '76742300',
      status: 'ACTIVE',
      last_access: new Date().toISOString(),
      avatar: 'users/1/avatar.jpg'
    },
    // Empleado
    {
      username: 'fchavez',
      password: defaultPassword,
      full_name: 'Fabricio Chavez',
      email: 'fchavez21@gmail.com',
      date_of_birth: '1995-08-15',
      phone: '71234567',
      status: 'ACTIVE',
      last_access: new Date().toISOString(),
      avatar: 'users/2/avatar.jpg'
    },
    // Vendedor / Personal de ventas AURA
    {
      username: 'mrodriguez',
      password: defaultPassword,
      full_name: 'Mariana Rodriguez',
      email: 'mrodriguez233@gmail.com',
      date_of_birth: '1998-03-22',
      phone: '72345678',
      status: 'ACTIVE',
      last_access: new Date().toISOString(),
      avatar: 'users/3/avatar.jpg'
    }
  ]);
};
