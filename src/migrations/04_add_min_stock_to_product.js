exports.up = async function(knex) {
  await knex.schema.alterTable('product', table => {
    table.integer('min_stock').notNullable().defaultTo(5);
  });
};

exports.down = async function(knex) {
  await knex.schema.alterTable('product', table => {
    table.dropColumn('min_stock');
  });
};
