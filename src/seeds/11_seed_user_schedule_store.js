exports.seed = async function(knex) {
  await knex('user_schedule_store').del();

  const store = await knex('store')
    .select('id')
    .whereRaw('LOWER(name) = ?', ['aura'])
    .first();

  if (!store) {
    throw new Error('Store AURA was not found. Check 07_seed_stores.js.');
  }

  const scheduleMorning = await knex('schedule').select('id').where({ name: 'Mañana' }).first();
  const scheduleAfternoon = await knex('schedule').select('id').where({ name: 'Tarde' }).first();
  const scheduleFull = await knex('schedule').select('id').where({ name: 'Turno completo' }).first();

  const employeeChavez = await knex('user').select('id').where({ email: 'fchavez21@gmail.com' }).first();
  const sellerRodriguez = await knex('user').select('id').where({ email: 'mrodriguez233@gmail.com' }).first();
  const adminLaguna = await knex('user').select('id').where({ email: 'slaguna@gmail.com' }).first();

  const assignments = [];

  if (employeeChavez && scheduleMorning) {
    assignments.push({
      user_id: employeeChavez.id,
      schedule_id: scheduleMorning.id,
      store_id: store.id,
      created_at: new Date(),
      updated_at: new Date()
    });
  }

  if (sellerRodriguez && scheduleAfternoon) {
    assignments.push({
      user_id: sellerRodriguez.id,
      schedule_id: scheduleAfternoon.id,
      store_id: store.id,
      created_at: new Date(),
      updated_at: new Date()
    });
  }

  if (adminLaguna && (scheduleFull || scheduleMorning)) {
    assignments.push({
      user_id: adminLaguna.id,
      schedule_id: (scheduleFull || scheduleMorning).id,
      store_id: store.id,
      created_at: new Date(),
      updated_at: new Date()
    });
  }

  if (assignments.length > 0) {
    await knex('user_schedule_store').insert(assignments);
  }
};
