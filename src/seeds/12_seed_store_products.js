exports.seed = async function (knex) {
  // Limpia la tabla pivote (si tienes FK, este orden debe ser seguro)
  await knex('store_product').del();

  // --- Busca IDs de tiendas por nombre (desde 07_seed_stores) ---
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

  // --- Busca IDs de productos por SKU (desde 10_seed_products) ---
  const p1 = await knex('product').select('id').where({ SKU: 'SKU-001' }).first();
  const p2 = await knex('product').select('id').where({ SKU: 'SKU-002' }).first();
  const p3 = await knex('product').select('id').where({ SKU: 'SKU-003' }).first();

  if (!p1 || !p2 || !p3) {
    throw new Error('No se encontraron los productos esperados. Verifica 10_seed_products.js');
  }

  // --- Inserta stock por tienda ---
  // Requerido:
  // - Productos 1, 2 y 3 en tienda 1 con stock 10 cada uno
  // - Productos 1 y 2 en tienda 2 con stock 5 cada uno
  await knex('store_product').insert([
    // Tienda 1
    { store_id: store1.id, product_id: p1.id, stock: 10 },
    { store_id: store1.id, product_id: p2.id, stock: 10 },
    { store_id: store1.id, product_id: p3.id, stock: 10 },

    // Tienda 2
    { store_id: store2.id, product_id: p1.id, stock: 5 },
    { store_id: store2.id, product_id: p2.id, stock: 5 },
  ]);
};