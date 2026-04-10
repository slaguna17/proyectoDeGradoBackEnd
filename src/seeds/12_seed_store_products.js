exports.seed = async function (knex) {
  await knex('store_product').del();

  const store1 = await knex('store')
    .select('id')
    .where({ name: 'Juan del Sur' })
    .first();

  const store2 = await knex('store')
    .select('id')
    .where({ name: 'MiniMarket El Vecino' })
    .first();

  if (!store1 || !store2) {
    throw new Error('No se encontraron las tiendas esperadas. Verifica 07_seed_stores.js');
  }

  const p1 = await knex('product').select('id').where({ SKU: 'SKU-001' }).first();
  const p2 = await knex('product').select('id').where({ SKU: 'SKU-002' }).first();
  const p3 = await knex('product').select('id').where({ SKU: 'SKU-003' }).first();

  if (!p1 || !p2 || !p3) {
    throw new Error('No se encontraron los productos esperados. Verifica 10_seed_products.js');
  }

  await knex('store_product').insert([
    // Tienda 1
    {
      store_id: store1.id,
      product_id: p1.id,
      stock: 18,
      expiration_date: '2026-10-20'
    },
    {
      store_id: store1.id,
      product_id: p2.id,
      stock: 25,
      expiration_date: '2026-08-15'
    },
    {
      store_id: store1.id,
      product_id: p3.id,
      stock: 12,
      expiration_date: '2026-05-30'
    },

    // Tienda 2
    {
      store_id: store2.id,
      product_id: p1.id,
      stock: 9,
      expiration_date: '2026-11-10'
    },
    {
      store_id: store2.id,
      product_id: p2.id,
      stock: 14,
      expiration_date: '2026-09-05'
    }
  ]);
};