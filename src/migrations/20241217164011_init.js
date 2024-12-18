const { default: knex } = require("knex");

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable("user", table => {
    table.increments('id').primary();
    table.string('username').notNullable();
    table.string('password').notNullable();
    table.string('full_name').notNullable();
    table.string('email').notNullable().unique();
    table.string('date_of_birth').notNullable();
    table.string('phone').notNullable();
    table.string('status').notNullable();
    table.string('last_access').notNullable();
    table.string('avatar');
    table.timestamps(true, true);
  })
  console.log("Cree la tabla")
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('user')
};

//3 functions, generateTables, generateIntermidiateTables and drop tables
function generateTables(){
    //14 entities tables
    
    //1. user
    knex.schema.createTable("user", table => {
        table.increments('id').primary();
        table.string('username').notNullable();
        table.string('password').notNullable();
        table.string('full_name').notNullable();
        table.string('email').notNullable().unique();
        table.string('date_of_birth').notNullable();
        table.string('phone').notNullable();
        table.string('status').notNullable();
        table.string('last_access').notNullable();
        table.string('avatar');
        table.timestamps(true, true);
      })

    //2. permit
    knex.schema.createTable("permit", table => {
        table.increments('id').primary();
        table.string('name');
        table.string('description');
        table.timestamps(true, true);
    })
    //3. role
    knex.schema.createTable("role", table => {
        table.increments('id').primary();
        table.string('name');
        table.string('description');
        table.boolean('isAdmin');
        table.timestamps(true, true);
    })
    //4. shift
    knex.schema.createTable("shift", table => {
        table.increments('id').primary();
        table.string('name');
        table.integer('lenght');
        table.time('start_time');
        table.time('end_time')
        table.timestamps(true, true);
    })
    //5. store
    knex.schema.createTable("store", table => {
        table.increments('id').primary();
        table.string('name');
        table.string('address');
        table.string('city');
        table.string('logo')
        table.string('history')
        table.string('phone')
        table.jsonb('socials')
        table.timestamps(true, true);
    })
    //6. provider
    knex.schema.createTable("provider", table => {
        table.increments('id').primary();
        table.string('name');
        table.string('address');
        table.string('phone')
        table.string('email');
        table.string('contact_person_name')
        table.string('notes')
        table.timestamps(true, true);
    })
    //7. product
    knex.schema.createTable("product", table => {
        table.increments('id').primary();
        table.integer('SKU');
        table.string('name');
        table.string('description');
        table.string('image');
        table.string('brand');
        table.foreign('category_id').references('id').inTable('category');
        table.timestamps(true, true);
    })    
    //8. category
    knex.schema.createTable("category", table => {
        table.increments('id').primary();
        table.string('name');
        table.string('description');
        table.timestamps(true, true);
    })
    //9. forecast
    knex.schema.createTable("forecast", table => {
        table.increments('id').primary();
        table.foreign('product_id').references('id').inTable('product');
        table.time('date_generated');
        table.string('suggested_action');
        table.string('method');
        table.string('accuracy');
        table.time('date_updated');
        table.string('trust');
        table.timestamps(true, true);
    }) 
    //10. sales
    knex.schema.createTable("sales", table => {
        table.increments('id').primary();
        table.foreign('sales_box_id').references('id').inTable('sales_box');
        table.foreign('user_id').references('id').inTable('user');
        table.foreign('store_id').references('id').inTable('store');
        table.foreign('product_id').references('id').inTable('product');
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
    knex.schema.createTable("purchase", table => {
        table.increments('id').primary();
        table.foreign('purchase_box_id').references('id').inTable('purchase_box');
        table.foreign('user_id').references('id').inTable('user');
        table.foreign('store_id').references('id').inTable('store');
        table.foreign('product_id').references('id').inTable('product');
        table.foreign('provider_id').references('id').inTable('provider');
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
    //12. sales box
    knex.schema.createTable("sales_box", table => {
        table.increments('id').primary();
        table.time('opening_time');
        table.time('clossing_time');
        table.time('date');
        table.integer('initial_amount');
        table.integer('clossing_amount');
        table.integer('total');
        table.boolean('isProfit');
        table.timestamps(true, true);
    }) 
    //13. purchase box
    knex.schema.createTable("purchase_box", table => {
        table.increments('id').primary();
        table.time('opening_time');
        table.time('clossing_time');
        table.time('date');
        table.integer('initial_amount');
        table.integer('clossing_amount');
        table.integer('total');
        table.boolean('isProfit');
        table.timestamps(true, true);
    }) 
    //14. total cash
    knex.schema.createTable("total_cash", table => {
        table.increments('id').primary();
        table.foreign('purchase_box_id').references('id').inTable('purchase_box');
        table.foreign('sales_box_id').references('id').inTable('sales_box');
        table.time('date');
        table.boolean('isProfit');
        table.integer('period');
        table.string('filters');
        table.string('graphs');
        table.timestamps(true, true);
    }) 
      
}

function generateIntermidiateTables(){
    //8 intermidiary tables

    //1. Role-Permit table
    knex.schema.createTable("role_permit", table => {
        table.increments('id').primary();
        table.foreign('role_id').references('id').inTable('role');
        table.foreign('permit_id').references('id').inTable('permit');
        table.timestamps(true, true);
    })
    
    //2. User-role table
    knex.schema.createTable("user_role", table => {
        table.increments('id').primary();
        table.foreign('user_id').references('id').inTable('user');
        table.foreign('role_id').references('id').inTable('role');
        table.timestamps(true, true);
    })

    //3. User-Shift-Store table
    knex.schema.createTable("user_shift_store", table => {
        table.increments('id').primary();
        table.foreign('user_id').references('id').inTable('user');
        table.foreign('shift_id').references('id').inTable('shift');
        table.foreign('store_id').references('id').inTable('store');
        table.timestamps(true, true);
    })

    //4. Store-Product table
    knex.schema.createTable("store_product", table => {
        table.increments('id').primary();
        table.foreign('store_id').references('id').inTable('store');
        table.foreign('product_id').references('id').inTable('product');
        table.timestamps(true, true);
    })

    //5. Sales - Product table
    knex.schema.createTable("sales_product", table => {
        table.increments('id').primary();
        table.foreign('sales_id').references('id').inTable('sales');
        table.foreign('product_id').references('id').inTable('product');
        table.integer('quantity_per_product').notNullable()
        table.timestamps(true, true);
    })
    //6. Purchases - Product table
    knex.schema.createTable("purchase_product", table => {
        table.increments('id').primary();
        table.foreign('purchase_id').references('id').inTable('purchase');
        table.foreign('product_id').references('id').inTable('product');
        table.integer('quantity_per_product').notNullable()
        table.timestamps(true, true);
    })        
    //7. Provider - Store table
    knex.schema.createTable("provider_store", table => {
        table.increments('id').primary();
        table.foreign('provider_id').references('id').inTable('provider');
        table.foreign('store_id').references('id').inTable('store');
        table.timestamps(true, true);
    })    
    //8. Provider - Product table
    knex.schema.createTable("provider_product", table => {
        table.increments('id').primary();
        table.foreign('provider_id').references('id').inTable('provider');
        table.foreign('product_id').references('id').inTable('product');
        table.timestamps(true, true);
    })        
}

function dropAllTables(){
    //22 total tables (14 entities and 8 intermediary)
    //Main tables
    knex.schema.dropTable('user');
    knex.schema.dropTable('permit');
    knex.schema.dropTable('role');
    knex.schema.dropTable('shift');
    knex.schema.dropTable('store');
    knex.schema.dropTable('provider');
    knex.schema.dropTable('product');
    knex.schema.dropTable('category');
    knex.schema.dropTable('forecast');
    knex.schema.dropTable('sales');
    knex.schema.dropTable('purchase');
    knex.schema.dropTable('sales_box');
    knex.schema.dropTable('purchase_box');
    knex.schema.dropTable('total_cash');
    //Intermediary
    knex.schema.dropTable('role_permit');
    knex.schema.dropTable('user_role');
    knex.schema.dropTable('user_shift_store');
    knex.schema.dropTable('store_product');
    knex.schema.dropTable('sales_product');
    knex.schema.dropTable('purchase_product');
    knex.schema.dropTable('provider_store');
    knex.schema.dropTable('provider_product');

}