const bcrypt = require('bcrypt');

exports.seed = async function(knex) {
  await knex('user').whereIn('id', [1, 2]).del();

  const adminPassword = await bcrypt.hash('1', 10);
  const employeePassword = await bcrypt.hash('1', 10);

  await knex('user').insert([
    //Admin
    {
      id: 1,
      username: 'slaguna',
      password: adminPassword,
      full_name: 'Sergio Laguna',
      email: 'slaguna@gmail.com',
      date_of_birth: '1999-04-01',
      phone: '76742300',
      status: 'ACTIVE',
      last_access: new Date().toISOString()
    },
    // Regular
    {
      id: 2,
      username: 'jperez',
      password: employeePassword,
      full_name: 'Juan Perez',
      email: 'jperez@gmail.com',
      date_of_birth: '1995-08-15',
      phone: '71234567',
      status: 'ACTIVE',
      last_access: new Date().toISOString()
    }
  ]);
};