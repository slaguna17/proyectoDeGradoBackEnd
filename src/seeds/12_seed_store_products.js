exports.seed = async function (knex) {
  await knex('store_product').del();

  const store = await knex('store')
    .select('id')
    .where({ name: 'Aura' })
    .first();

  if (!store) {
    throw new Error('No se encontro la tienda esperada. Verifica 07_seed_stores.js');
  }

  const jacket = await knex('product').select('id').where({ SKU: 'AURA-CHAQ-001' }).first();
  const tShirt = await knex('product').select('id').where({ SKU: 'AURA-POL-001' }).first();

  if (!jacket || !tShirt) {
    throw new Error('No se encontraron los productos esperados. Verifica 10_seed_products.js');
  }

  await knex('store_product').insert([
    {
      store_id: store.id,
      product_id: jacket.id,
      stock: 3,
      expiration_date: null
    },
    {
      store_id: store.id,
      product_id: tShirt.id,
      stock: 10,
      expiration_date: null
    }
  ]);
};
