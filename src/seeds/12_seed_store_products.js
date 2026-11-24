exports.seed = async function (knex) {
  await knex('store_product').del();

  const store = await knex('store')
    .select('id')
    .whereRaw('LOWER(name) = ?', ['aura'])
    .first();

  if (!store) {
    throw new Error('Store AURA was not found. Check 07_seed_stores.js.');
  }

  const products = await knex('product').select('id', 'SKU');

  if (products.length === 0) {
    throw new Error('No products found to stock for store AURA. Check 10_seed_products.js.');
  }

  // Realistic small boutique inventory (6 to 10 garments per model)
  const stockLevels = {
    'AURA-SUD-001': 8,   // Sudadera Nike (ej. tallas S: 2, M: 3, L: 3)
    'AURA-VES-001': 6,   // Vestido a rayas (ej. tallas S: 2, M: 2, L: 2)
    'AURA-SUE-001': 10   // Chompa Stitch (ej. tallas S: 3, M: 4, L: 3)
  };

  const storeProducts = products.map((prod) => ({
    store_id: store.id,
    product_id: prod.id,
    stock: stockLevels[prod.SKU] || 8,
    expiration_date: null
  }));

  await knex('store_product').insert(storeProducts);
};
