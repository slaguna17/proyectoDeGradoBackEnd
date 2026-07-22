exports.seed = async function(knex) {
  const environment = knex.userParams?.environment;

  if (!['development', 'test'].includes(environment)) {
    throw new Error(`Refusing to reset application tables in environment: ${environment || 'unknown'}`);
  }

  const tables = [
    'cart_item',
    'shopping_cart',
    'cash_movement',
    'cash_session',
    'sales_product',
    'purchase_product',
    'store_product',
    'provider_product',
    'provider_store',
    'user_schedule_store',
    'user_role',
    'role_permit',
    'sales',
    'purchase',
    'product',
    'category',
    'provider',
    'store',
    'schedule',
    'permit',
    'role',
    'user'
  ];

  if (await knex.schema.hasTable('cash_count')) {
    tables.unshift('cash_count');
  }

  const tableList = tables.map(table => `"${table}"`).join(', ');
  await knex.raw(`TRUNCATE TABLE ${tableList} RESTART IDENTITY CASCADE`);
};
