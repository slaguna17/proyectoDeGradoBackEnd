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

  const jacket = await knex('product').select('id').where({ SKU: 'AURA-CHAQ-001' }).first();
  const tShirt = await knex('product').select('id').where({ SKU: 'AURA-POL-001' }).first();

  if (!jacket || !tShirt) {
    throw new Error('No se encontraron los productos esperados. Verifica 10_seed_products.js');
  }

  await knex('provider_product').insert([
    // Distribuidora Norte
    { provider_id: provider1.id, product_id: tShirt.id },

    // Mayorista Central
    { provider_id: provider2.id, product_id: jacket.id }
  ]);
};
