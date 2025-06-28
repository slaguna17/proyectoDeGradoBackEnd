//Intermediary entities (7 TABLES)
//role_permit, user_role, user_schedule_store, store_product, sales_product, purchase_product, provider_store, provider_product
exports.up = async function(knex) {
    //8 intermidiary tables

    //15. Role-Permit table
    await knex.schema.createTable("role_permit", table => {
        table.increments('id').primary();
        table.integer('role_id').unsigned().references('id').inTable('role');
        table.integer('permit_id').unsigned().references('id').inTable('permit');
        table.timestamps(true, true);
    })
    
    //16. User-Shift-Store table
    await knex.schema.createTable("user_schedule_store", table => {
        table.increments('id').primary();
        table.integer('user_id').unsigned().references('id').inTable('user');
        table.integer('schedule_id').unsigned().references('id').inTable('schedule');
        table.integer('store_id').unsigned().references('id').inTable('store');
        table.timestamps(true, true);
    })

    //17. user_role table
    await knex.schema.createTable("user_role", table => {
        table.increments('id').primary();
        table.integer('user_id').unsigned().references('id').inTable('user').onDelete('CASCADE');
        table.integer('role_id').unsigned().references('id').inTable('role').onDelete('CASCADE');
        table.timestamps(true, true);
        table.unique(['user_id', 'role_id']);
    });

    //18. Store-Product table
    await knex.schema.createTable("store_product", table => {
        table.increments('id').primary();
        table.integer('store_id').unsigned().references('id').inTable('store');
        table.integer('product_id').unsigned().references('id').inTable('product');
        table.integer('stock').notNullable();
        table.string('expiration_date')
        table.timestamps(true, true);
    })

    //19. Sales - Product table
    await knex.schema.createTable("sales_product", table => {
        table.increments('id').primary();
        table.integer('sales_id').unsigned().references('id').inTable('sales').onDelete("CASCADE");
        table.integer('product_id').unsigned().references('id').inTable('product').onDelete("CASCADE");
        table.integer('quantity').notNullable();
        table.decimal("unit_price", 10, 2);
        table.timestamps(true, true);
    })

    //20. Purchases - Product table
    await knex.schema.createTable("purchase_product", table => {
        table.increments("id").primary();
        table.integer("purchase_id").unsigned().references("id").inTable("purchase").onDelete("CASCADE");
        table.integer("product_id").unsigned().references("id").inTable("product").onDelete("CASCADE");
        table.integer("quantity").notNullable();
        table.decimal("unit_price", 10, 2);
        table.timestamps(true, true);

    });

    
    //21. Provider - Store table
    await knex.schema.createTable("provider_store", table => {
        table.increments('id').primary();
        table.integer('provider_id').unsigned().references('id').inTable('provider');
        table.integer('store_id').unsigned().references('id').inTable('store');
        table.timestamps(true, true);
    })

    //22. Provider - Product table
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
    await knex.schema.dropTableIfExists('user_schedule_store');
    await knex.schema.dropTableIfExists('store_product');
    await knex.schema.dropTableIfExists('sales_product');
    await knex.schema.dropTableIfExists('purchase_product');
    await knex.schema.dropTableIfExists('provider_store');
    await knex.schema.dropTableIfExists('provider_product');
    await knex.schema.dropTableIfExists('user_role');
}