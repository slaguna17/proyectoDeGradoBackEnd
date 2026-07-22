exports.up = async function(knex) {
  await knex.schema.createTable('cash_count', table => {
    table.increments('id').primary();
    table.integer('cash_session_id').unsigned().notNullable()
      .references('id').inTable('cash_session').onDelete('CASCADE');
    table.string('currency', 3).notNullable().defaultTo('BOB');
    table.decimal('denomination', 10, 2).notNullable();
    table.integer('quantity').notNullable();
    table.timestamps(true, true);

    table.index(['cash_session_id'], 'idx_cash_count_cash_session_id');
  });
};

exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('cash_count');
};
