// Dependent entities (7 TABLES)
// PRODUCT, SALES, PURCHASE, CASH_SESSION, CASH_MOVEMENT, SHOPPING_CART, CART_ITEM

exports.up = async function(knex) {

  // 8. product
  await knex.schema.createTable("product", table => {
    table.increments('id').primary();
    table.string('SKU').notNullable();
    table.string('name').notNullable();
    table.string('description');
    table.string('image');
    table.string('brand').notNullable();
    table.decimal('sale_price', 10, 2).notNullable().defaultTo(0.00);
    table.decimal('purchase_price', 10, 2).notNullable().defaultTo(0.00);
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

  // 9. sales
  await knex.schema.createTable("sales", table => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().references('id').inTable('user');
    table.integer('store_id').unsigned().references('id').inTable('store');
    table.decimal('total', 10, 2).defaultTo(0);
    table.timestamp('sale_date');
    table.string('payment_method');
    table.string('status');
    table.string('notes');
    table.timestamps(true, true);
  });

  // 10. purchase
  await knex.schema.createTable("purchase", table => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().references('id').inTable('user');
    table.integer('store_id').unsigned().references('id').inTable('store');
    table.integer('provider_id').unsigned().references('id').inTable('provider');
    table.decimal('total', 10, 2).defaultTo(0);
    table.timestamp('purchase_date');
    table.string('payment_method');
    table.string('status');
    table.string('notes');
    table.timestamps(true, true);
  });

  // 11. CASH_SESSION
  await knex.schema.createTable('cash_session', table => {
    table.increments('id').primary();

    table.integer('store_id').unsigned().notNullable()
      .references('id').inTable('store')
      .onDelete('CASCADE');

    table.decimal('opening_amount', 10, 2).notNullable().defaultTo(0);
    table.decimal('closing_amount', 10, 2);

    table.string('status').notNullable().defaultTo('open');
    table.timestamp('opened_at').notNullable().defaultTo(knex.fn.now());
    table.date('opened_on').notNullable().defaultTo(knex.raw('CURRENT_DATE'));

    table.timestamp('closed_at');
    table.boolean('isProfit');
    table.integer('period');
    table.string('filters');
    table.string('graphs');

    table.timestamps(true, true);
  });

  // 12. cash_movement
  await knex.schema.createTable('cash_movement', table => {
    table.increments('id').primary();

    table.integer('store_id').unsigned().notNullable()
      .references('id').inTable('store').onDelete('CASCADE');

    table.integer('cash_session_id').unsigned().notNullable()
      .references('id').inTable('cash_session').onDelete('CASCADE');

    table.integer('user_id').unsigned().notNullable()
      .references('id').inTable('user').onDelete('CASCADE');

    table.string('direction').notNullable(); // 'IN', 'OUT', 'ADJUST'
    table.decimal('amount', 10, 2).notNullable().defaultTo(0);
    table.string('origin_type').nullable(); // 'SALE', 'PURCHASE', 'MANUAL_ADJUSTMENT', etc.
    table.integer('origin_id').unsigned().nullable();
    table.string('category');
    table.string('notes');

    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());

    table.index(['store_id', 'cash_session_id']);
    table.index(['direction', 'store_id']);
    table.index(['created_at']);
  });

  // 13. shopping_cart (Provided by Whatsapp agent)
  await knex.schema.createTable('shopping_cart', table => {
    table.increments('id').primary();
    table.integer('store_id').unsigned().references('id').inTable('store').onDelete('CASCADE');
    
    // Customer information
    table.string('customer_phone').notNullable(); 
    table.string('customer_name').nullable();
    
    table.string('status').defaultTo('pending');
    table.decimal('total_estimated', 10, 2).defaultTo(0);
    
    table.timestamps(true, true);
  });

  // 14. cart_item (Items inside the shopping_cart)
  await knex.schema.createTable('cart_item', table => {
    table.increments('id').primary();
    table.integer('shopping_cart_id').unsigned().references('id').inTable('shopping_cart').onDelete('CASCADE');
    table.integer('product_id').unsigned().references('id').inTable('product').onDelete('CASCADE');
    
    table.integer('quantity').notNullable().defaultTo(1);
    table.decimal('unit_price', 10, 2).notNullable(); 
    
    table.timestamps(true, true);
  });

  // --------- INDEXES / CONSTRAINTS ----------
  await knex.raw(`
    CREATE UNIQUE INDEX IF NOT EXISTS cash_session_one_open_per_store_per_day
    ON cash_session (store_id, opened_on)
    WHERE status = 'open'
  `);

  await knex.raw(`CREATE INDEX IF NOT EXISTS idx_sales_store_created_at ON sales (store_id, created_at);`);
  await knex.raw(`CREATE INDEX IF NOT EXISTS idx_purchase_store_created_at ON purchase (store_id, created_at);`);
};

exports.down = async function(knex) {
  await knex.raw(`DROP INDEX IF EXISTS cash_session_one_open_per_store_per_day;`);
  await knex.schema.dropTableIfExists('cart_item');
  await knex.schema.dropTableIfExists('shopping_cart');
  await knex.schema.dropTableIfExists('cash_movement');
  await knex.schema.dropTableIfExists('cash_session');
  await knex.schema.dropTableIfExists('purchase');
  await knex.schema.dropTableIfExists('sales');
  await knex.schema.dropTableIfExists('forecast');
  await knex.schema.dropTableIfExists('product');
};
