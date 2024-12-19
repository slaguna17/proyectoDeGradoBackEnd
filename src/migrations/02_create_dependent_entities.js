//Dependant entities (5 TABLES)
//PRODUCT, FORECAST, SALES, PURCHASE, TOTAL_CASH
exports.up = async function(knex) {
    //8. product
    await knex.schema.createTable("product", table => {
        table.increments('id').primary();
        table.integer('SKU');
        table.string('name');
        table.string('description');
        table.string('image');
        table.string('brand');
        table.integer('category_id').unsigned().references('id').inTable('category');
        table.timestamps(true, true);
    })
    
    //9. forecast
    await knex.schema.createTable("forecast", table => {
        table.increments('id').primary();
        table.integer('product_id').unsigned().references('id').inTable('product');
        table.time('date_generated');
        table.string('suggested_action');
        table.string('method');
        table.string('accuracy');
        table.time('date_updated');
        table.string('trust');
        table.timestamps(true, true);
    })    
    
    //10. sales
    await knex.schema.createTable("sales", table => {
        table.increments('id').primary();
        table.integer('sales_box_id').unsigned().references('id').inTable('sales_box');
        table.integer('user_id').unsigned().references('id').inTable('user');
        table.integer('store_id').unsigned().references('id').inTable('store');
        table.integer('product_id').unsigned().references('id').inTable('product');
        table.time('sale_date');
        table.string('sale_price')
        table.integer('sale_total');
        table.string('payment_method');
        table.integer('number_of_products');
        table.string('status');
        table.string('notes');
        table.timestamps(true, true);
    })

    //11. purchase
    await knex.schema.createTable("purchase", table => {
        table.increments('id').primary();
        table.integer('purchase_box_id').unsigned().references('id').inTable('purchase_box');
        table.integer('user_id').unsigned().references('id').inTable('user');
        table.integer('store_id').unsigned().references('id').inTable('store');
        table.integer('product_id').unsigned().references('id').inTable('product');
        table.integer('provider_id').unsigned().references('id').inTable('provider');
        table.time('purchase_date');
        table.string('purchase_quantity')
        table.string('purchase_price')
        table.integer('purchase_total');
        table.string('payment_method');
        table.integer('number_of_products');
        table.string('status');
        table.string('notes');
        table.timestamps(true, true);
    })
    
    //14. total cash
    await knex.schema.createTable("total_cash", table => {
        table.increments('id').primary();
        table.integer('purchase_box_id').unsigned().references('id').inTable('purchase_box');
        table.integer('sales_box_id').unsigned().references('id').inTable('sales_box');
        table.time('date');
        table.boolean('isProfit');
        table.integer('period');
        table.string('filters');
        table.string('graphs');
        table.timestamps(true, true);
    })    
};


exports.down = async function(knex) {
    await knex.schema.dropTableIfExists('product');
    await knex.schema.dropTableIfExists('forecast');
    await knex.schema.dropTableIfExists('sales');
    await knex.schema.dropTableIfExists('purchase');
    await knex.schema.dropTableIfExists('total_cash');
};
