// src/seeds/08_seed_shifts.js
exports.seed = async function(knex) {
  await knex('shift').del();

  await knex('shift').insert([
    {
      name: 'Mañana',
      length: 8,
      start_time: '08:00',
      end_time: '16:00'
    },
    {
      name: 'Tarde',
      length: 8,
      start_time: '14:00',
      end_time: '22:00'
    },
    {
      name: 'Turno completo',
      length: 12,
      start_time: '08:00',
      end_time: '20:00'
    }
  ]);
};
