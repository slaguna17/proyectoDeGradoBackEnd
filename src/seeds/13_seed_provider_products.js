exports.seed = async function (knex) {
  await knex('provider_product').del();

  const provider1 = await knex('provider')
    .select('id')
    .where({ name: 'Distribuidora Norte' })
    .first();

  const provider2 = await knex('provider')
    .select('id')
    .where({ name: 'Mayorista Central' })
    .first();

  if (!provider1 || !provider2) {
    throw new Error('No se encontraron los proveedores esperados. Verifica 09_seed_providers.js');
  }

  const p1 = await knex('product').select('id').where({ SKU: 'SKU-001' }).first();
  const p2 = await knex('product').select('id').where({ SKU: 'SKU-002' }).first();
  const p3 = await knex('product').select('id').where({ SKU: 'SKU-003' }).first();

  if (!p1 || !p2 || !p3) {
    throw new Error('No se encontraron los productos esperados. Verifica 10_seed_products.js');
  }

  await knex('provider_product').insert([
    // Distribuidora Norte
    { provider_id: provider1.id, product_id: p1.id },
    { provider_id: provider1.id, product_id: p3.id },

    // Mayorista Central
    { provider_id: provider2.id, product_id: p1.id },
    { provider_id: provider2.id, product_id: p2.id }
  ]);
};