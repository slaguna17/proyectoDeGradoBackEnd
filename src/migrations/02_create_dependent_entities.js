// Dependent entities (5 TABLES)
// PRODUCT, FORECAST, SALES, PURCHASE, CASH_SUMMARY

exports.up = async function(knex) {

    // 10. product
    await knex.schema.createTable("product", table => {
        table.increments('id').primary();
        table.string('SKU');
        table.string('name');
        table.string('description');
        table.string('image');
        table.string('brand');
        table.integer('category_id').unsigned().references('id').inTable('category');
        table.timestamps(true, true);
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

    // 12. sales (VENTA general, sin detalle por producto)
    await knex.schema.createTable("sales", table => {
        table.increments('id').primary();
        table.integer('sales_box_id').unsigned().references('id').inTable('sales_box');
        table.integer('user_id').unsigned().references('id').inTable('user');
        table.integer('store_id').unsigned().references('id').inTable('store');
        table.decimal('total', 10, 2).defaultTo(0);
        table.timestamp('sale_date');
        table.string('payment_method');
        table.string('status');
        table.string('notes');
        table.timestamps(true, true);
    });

    // 13. purchase (COMPRA general, sin detalle por producto)
    await knex.schema.createTable("purchase", table => {
        table.increments('id').primary();
        table.integer('purchase_box_id').unsigned().references('id').inTable('purchase_box');
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

    // 14. cash_summary (CAJA TOTAL - antes llamado total_cash)
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
        table.timestamp('opened_at').notNullable().defaultTo(knex.fn.now());
        table.timestamp('closed_at');

        // Opcionales
        table.boolean('isProfit');
        table.integer('period');
        table.string('filters');
        table.string('graphs');

        table.timestamps(true, true);
    });
};

exports.down = async function(knex) {
    await knex.schema.dropTableIfExists('cash_summary');
    await knex.schema.dropTableIfExists('purchase');
    await knex.schema.dropTableIfExists('sales');
    await knex.schema.dropTableIfExists('forecast');
    await knex.schema.dropTableIfExists('product');
};
