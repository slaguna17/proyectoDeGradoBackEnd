exports.seed = async function(knex) {
  await knex('user_schedule_store').del();

  // Asocia el usuario 1 al turno 1 y a la tienda 1
  await knex('user_schedule_store').insert([
    {
      user_id: 1, // El id del usuario 'slaguna'
      schedule_id: 1, // 'Mañana'
      store_id: 1,    // 'Juan del Sur'
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);
};
