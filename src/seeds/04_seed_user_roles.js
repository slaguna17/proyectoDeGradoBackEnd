exports.seed = async function(knex) {
  await knex('user_role').del();

  await knex('user_role').insert([
    //Admin
    { user_id: 1, role_id: 1 },
    
    //Regular
    { user_id: 2, role_id: 2 }
  ]);
};