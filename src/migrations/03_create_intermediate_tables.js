//Intermediary entities (7 TABLES)
//role_permit, user_role, user_shift_store, store_product, sales_product, purchase_product, provider_store, provider_product
exports.up = async function(knex) {
    //8 intermidiary tables

    //1. Role-Permit table
    await knex.schema.createTable("role_permit", table => {
        table.increments('id').primary();
        table.integer('role_id').unsigned().references('id').inTable('role');
        table.integer('permit_id').unsigned().references('id').inTable('permit');
        table.timestamps(true, true);
    })
    
    //2. User-Shift-Store table
    await knex.schema.createTable("user_shift_store", table => {
        table.increments('id').primary();
        table.integer('user_id').unsigned().references('id').inTable('user');
        table.integer('shift_id').unsigned().references('id').inTable('shift');
        table.integer('store_id').unsigned().references('id').inTable('store');
        table.timestamps(true, true);
    })

    await knex.schema.createTable("user_role", table => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().references('id').inTable('user').onDelete('CASCADE');
    table.integer('role_id').unsigned().references('id').inTable('role').onDelete('CASCADE');
    table.timestamps(true, true);
    // Para asegurar que un usuario no tenga el mismo rol múltiples veces
    table.unique(['user_id', 'role_id']);
  });

    //3. Store-Product table
    await knex.schema.createTable("store_product", table => {
        table.increments('id').primary();
        table.integer('store_id').unsigned().references('id').inTable('store');
        table.integer('product_id').unsigned().references('id').inTable('product');
        table.integer('stock').notNullable();
        table.string('expiration_date')
        table.timestamps(true, true);
    })

    //4. Sales - Product table
    await knex.schema.createTable("sales_product", table => {
        table.increments('id').primary();
        table.integer('sales_id').unsigned().references('id').inTable('sales');
        table.integer('product_id').unsigned().references('id').inTable('product');
        table.integer('quantity_per_product').notNullable()
        table.timestamps(true, true);
    })
    //5. Purchases - Product table
    await knex.schema.createTable("purchase_product", table => {
        table.increments('id').primary();
        table.integer('purchase_id').unsigned().references('id').inTable('purchase');
        table.integer('product_id').unsigned().references('id').inTable('product');
        table.integer('quantity_per_product').notNullable()
        table.timestamps(true, true);
    })     
    //6. Provider - Store table
    await knex.schema.createTable("provider_store", table => {
        table.increments('id').primary();
        table.integer('provider_id').unsigned().references('id').inTable('provider');
        table.integer('store_id').unsigned().references('id').inTable('store');
        table.timestamps(true, true);
    })
    //7. Provider - Product table
    await knex.schema.createTable("provider_product", table => {
        table.increments('id').primary();
        table.integer('provider_id').unsigned().references('id').inTable('provider');
        table.integer('product_id').unsigned().references('id').inTable('product');
        table.timestamps(true, true);
    })        
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
    //Intermediary
    await knex.schema.dropTableIfExists('role_permit');
    await knex.schema.dropTableIfExists('user_role');
    await knex.schema.dropTableIfExists('user_shift_store');
    await knex.schema.dropTableIfExists('store_product');
    await knex.schema.dropTableIfExists('sales_product');
    await knex.schema.dropTableIfExists('purchase_product');
    await knex.schema.dropTableIfExists('provider_store');
    await knex.schema.dropTableIfExists('provider_product');
    await knex.schema.dropTableIfExists('user_role');
}