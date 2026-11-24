exports.seed = async function (knex) {
  await knex('provider_product').del();

  const provider1 = await knex('provider')
    .select('id')
    .where({ name: 'Distribuidora Textil Norte' })
    .first();

  const provider2 = await knex('provider')
    .select('id')
    .where({ name: 'Confecciones & Moda Andina' })
    .first();

  if (!provider1 || !provider2) {
    throw new Error('No se encontraron los proveedores esperados. Verifica 09_seed_providers.js');
  }

  const products = await knex('product').select('id', 'SKU');

  if (products.length === 0) {
    throw new Error('No se encontraron productos para asociar a proveedores.');
  }

  const providerProducts = [];

  for (const prod of products) {
    if (prod.SKU === 'AURA-SUD-001') {
      providerProducts.push({ provider_id: provider1.id, product_id: prod.id });
    } else {
      providerProducts.push({ provider_id: provider2.id, product_id: prod.id });
    }
  }

  await knex('provider_product').insert(providerProducts);
};
