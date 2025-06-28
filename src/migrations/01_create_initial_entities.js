//Initial entities (9 TABLES)
//USER, PERMIT, ROLE, CATEGORY, SCHEDULE, STORE, PROVIDER, SALES_BOX, PURCHASE_BOX 
exports.up = async function(knex) {
      
    //1. user
    await knex.schema.createTable("user", table => {
        table.increments('id').primary();
        table.string('username').notNullable();
        table.string('password').notNullable();
        table.string('full_name').notNullable();
        table.string('email').notNullable().unique();
        table.string('date_of_birth');
        table.string('phone').notNullable();
        table.string('status').notNullable();
        table.string('last_access').notNullable();
        table.string('avatar');
        table.timestamps(true, true);
    });

    //2. permit
    await knex.schema.createTable("permit", table => {
        table.increments('id').primary();
        table.string('name').notNullable().unique();
        table.string('description');
        table.timestamps(true, true);
    })

    //3. role
    await knex.schema.createTable("role", table => {
        table.increments('id').primary();
        table.string('name');
        table.string('description');
        table.boolean('isAdmin');
        table.timestamps(true, true);
    })

    //4. schedule
    await knex.schema.createTable("schedule", table => {
        table.increments('id').primary();
        table.string('name');
        table.integer('length');
        table.string('start_time');
        table.string('end_time')
        table.timestamps(true, true);
    })

    //5. store
    await knex.schema.createTable("store", table => {
        table.increments('id').primary();
        table.string('name');
        table.string('address');
        table.string('city');
        table.string('logo')
        table.string('history')
        table.string('phone')
        // table.jsonb('socials')
        table.timestamps(true, true);
    })

    //6. provider
    await knex.schema.createTable("provider", table => {
        table.increments('id').primary();
        table.string('name');
        table.string('address');
        table.string('phone')
        table.string('email');
        table.string('contact_person_name')
        table.string('notes')
        table.timestamps(true, true);
    })

    //7. category
    await knex.schema.createTable("category", table => {
        table.increments('id').primary();
        table.string('name');
        table.string('description');
        table.string('image')
        table.timestamps(true, true);
    })

    //8. sales box
    await knex.schema.createTable('sales_box', table => {
        table.increments('id').primary();

        table.integer('store_id').unsigned().notNullable()
            .references('id').inTable('store')
            .onDelete('CASCADE');

        table.integer('user_id').unsigned().notNullable()
            .references('id').inTable('user')
            .onDelete('CASCADE');

        table.decimal('total', 10, 2).notNullable().defaultTo(0);
        table.integer('sales_count').notNullable().defaultTo(0);

        table.date('date').notNullable().defaultTo(knex.fn.now());

        table.timestamps(true, true);
    })
    
    //9. purchase box
    await knex.schema.createTable('purchase_box', table => {
        table.increments('id').primary();

        table.integer('store_id').unsigned().notNullable()
            .references('id').inTable('store')
            .onDelete('CASCADE');

        table.integer('user_id').unsigned().notNullable()
            .references('id').inTable('user')
            .onDelete('CASCADE');

        table.decimal('total', 10, 2).notNullable().defaultTo(0);
        table.integer('purchases_count').notNullable().defaultTo(0);

        table.date('purchase_date').notNullable().defaultTo(knex.fn.now());

        table.timestamps(true, true);
    });

};


exports.down = async function(knex) {
    await knex.schema.dropTableIfExists('user');
    await knex.schema.dropTableIfExists('permit');
    await knex.schema.dropTableIfExists('role');
    await knex.schema.dropTableIfExists('schedule');
    await knex.schema.dropTableIfExists('store');
    await knex.schema.dropTableIfExists('provider');
    await knex.schema.dropTableIfExists('category');
    await knex.schema.dropTableIfExists('sales_box');
    await knex.schema.dropTableIfExists('purchase_box');
};
