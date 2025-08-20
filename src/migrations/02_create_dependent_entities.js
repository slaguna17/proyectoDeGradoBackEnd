// Dependent entities (7 TABLES)
// PRODUCT, FORECAST, SALES, PURCHASE, CASH_SUMMARY, CASH_MOVEMENT, CASH_COUNT

exports.up = async function(knex) {

  // 10. product
  await knex.schema.createTable("product", table => {
    table.increments('id').primary();
    table.string('SKU').notNullable();
    table.string('name').notNullable();
    table.string('description');
    table.string('image');
    table.string('brand').notNullable();
    table
      .integer('category_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('category')
      .onDelete('RESTRICT');
    table.timestamps(true, true);
    table.unique(['SKU'], 'uniq_product_sku');
    table.index(['category_id'], 'idx_product_category_id');
  });


  // 11. forecast
  await knex.schema.createTable("forecast", table => {
    table.increments('id').primary();
    table.integer('product_id').unsigned().references('id').inTable('product');
    table.timestamp('date_generated');
    table.string('suggested_action');
    table.string('method');
    table.string('accuracy');
    table.timestamp('date_updated');
    table.string('trust');
    table.timestamps(true, true);
  });

  // 12. sales (VENTA general)
  await knex.schema.createTable("sales", table => {
    table.increments('id').primary();
    table.integer('sales_box_id').unsigned().references('id').inTable('sales_box');
    table.integer('user_id').unsigned().references('id').inTable('user');
    table.integer('store_id').unsigned().references('id').inTable('store');
    table.decimal('total', 10, 2).defaultTo(0);
    table.timestamp('sale_date');
    table.string('payment_method'); // "cash"/"efectivo"/otros
    table.string('status');
    table.string('notes');
    table.timestamps(true, true);
  });

  // 13. purchase (COMPRA general)
  await knex.schema.createTable("purchase", table => {
    table.increments('id').primary();
    table.integer('purchase_box_id').unsigned().references('id').inTable('purchase_box');
    table.integer('user_id').unsigned().references('id').inTable('user');
    table.integer('store_id').unsigned().references('id').inTable('store');
    table.integer('provider_id').unsigned().references('id').inTable('provider');
    table.decimal('total', 10, 2).defaultTo(0);
    table.timestamp('purchase_date');
    table.string('payment_method'); // "cash"/"efectivo"/otros
    table.string('status');
    table.string('notes');
    table.timestamps(true, true);
  });

  // 14. cash_summary (CAJA TOTAL)
  await knex.schema.createTable('cash_summary', table => {
    table.increments('id').primary();

    table.integer('store_id').unsigned().notNullable()
      .references('id').inTable('store')
      .onDelete('CASCADE');

    table.integer('purchase_box_id').unsigned()
      .references('id').inTable('purchase_box')
      .onDelete('SET NULL');

    table.integer('sales_box_id').unsigned()
      .references('id').inTable('sales_box')
      .onDelete('SET NULL');

    table.decimal('opening_amount', 10, 2).notNullable().defaultTo(0);
    table.decimal('closing_amount', 10, 2);

    table.string('status').notNullable().defaultTo('open');

    // Marca de tiempo completa y fecha "plana" del día de apertura
    table.timestamp('opened_at').notNullable().defaultTo(knex.fn.now());
    table.date('opened_on').notNullable().defaultTo(knex.raw('CURRENT_DATE'));

    table.timestamp('closed_at');

    // Campos opcionales existentes
    table.boolean('isProfit');
    table.integer('period');
    table.string('filters');
    table.string('graphs');

    table.timestamps(true, true);
  });

  // --- NUEVO: Movimientos manuales de caja ---
  await knex.schema.createTable('cash_movement', table => {
    table.increments('id').primary();

    table.integer('store_id').unsigned().notNullable()
      .references('id').inTable('store').onDelete('CASCADE');

    table.integer('cash_summary_id').unsigned().notNullable()
      .references('id').inTable('cash_summary').onDelete('CASCADE');

    table.integer('user_id').unsigned().notNullable()
      .references('id').inTable('user').onDelete('CASCADE');

    // 'IN' = ingreso, 'OUT' = egreso, 'ADJUST' = ajuste
    table.string('direction').notNullable();
    table.decimal('amount', 10, 2).notNullable().defaultTo(0);
    table.string('category');
    table.string('notes');

    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());

    table.index(['store_id', 'cash_summary_id']);
    table.index(['direction', 'store_id']);
    table.index(['created_at']);
  });

  // --- NUEVO: Conteo de billetes/monedas al cierre ---
  await knex.schema.createTable('cash_count', table => {
    table.increments('id').primary();

    table.integer('cash_summary_id').unsigned().notNullable()
      .references('id').inTable('cash_summary').onDelete('CASCADE');

    table.string('currency').notNullable().defaultTo('BOB');
    table.decimal('denomination', 10, 2).notNullable(); // 0.50, 1, 5, 10, 20, 50, 100, 200
    table.integer('quantity').notNullable().defaultTo(0);

    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());

    table.index(['cash_summary_id']);
  });

  // --------- ÍNDICES / RESTRICCIONES ----------
  // ✅ Reemplazo del índice problemático: sin expresión
  await knex.raw(`
    CREATE UNIQUE INDEX IF NOT EXISTS cash_summary_one_open_per_store_per_day
    ON cash_summary (store_id, opened_on)
    WHERE status = 'open'
  `);

  // Aceleran consultas por fecha (tu cierre usa created_at)
  await knex.raw(`CREATE INDEX IF NOT EXISTS idx_sales_store_created_at ON sales (store_id, created_at);`);
  await knex.raw(`CREATE INDEX IF NOT EXISTS idx_purchase_store_created_at ON purchase (store_id, created_at);`);
};

exports.down = async function(knex) {
  await knex.raw(`DROP INDEX IF EXISTS cash_summary_one_open_per_store_per_day;`);

  await knex.schema.dropTableIfExists('cash_count');
  await knex.schema.dropTableIfExists('cash_movement');

  await knex.schema.dropTableIfExists('cash_summary');
  await knex.schema.dropTableIfExists('purchase');
  await knex.schema.dropTableIfExists('sales');
  await knex.schema.dropTableIfExists('forecast');
  await knex.schema.dropTableIfExists('product');
};
