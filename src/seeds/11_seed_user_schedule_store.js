exports.seed = async function(knex) {
  await knex('user_schedule_store').del();

  const user = await knex('user').select('id').where({ email: 'slaguna@gmail.com' }).first();
  const schedule = await knex('schedule').select('id').where({ name: 'Mañana' }).first();
  const store = await knex('store').select('id').where({ name: 'Aura' }).first();

  if (!user || !schedule || !store) {
    throw new Error('Required user, schedule, or store was not found. Check the preceding seeds.');
  }

  await knex('user_schedule_store').insert([
    {
      user_id: user.id,
      schedule_id: schedule.id,
      store_id: store.id,
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);
};
