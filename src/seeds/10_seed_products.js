exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex('product').del();

  const categories = await knex('category')
    .select('id', 'name')
    .whereIn('name', ['Lacteos', 'Bebidas', 'Papas']);
  const categoryIds = Object.fromEntries(categories.map(({ id, name }) => [name, id]));

  if (!categoryIds.Lacteos || !categoryIds.Bebidas || !categoryIds.Papas) {
    throw new Error('Required categories were not found. Check 06_seed_categories.js.');
  }

  // Inserts seed entries
  await knex('product').insert([
    {
      SKU: 'SKU-001',
      name: 'Coca Cola 2L',
      description: 'Botella de gaseosa de 2 litros',
      image: 'https://fsa.bo/productos/01658-01.jpg',
      brand: 'Coca Cola',
      sale_price: 20,
      purchase_price: 14,
      category_id: categoryIds.Bebidas,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      SKU: 'SKU-002',
      name: 'Papas Lays Clásicas',
      description: 'Bolsa de papas fritas',
      image: 'https://m.media-amazon.com/images/I/8141nrQe0aL.jpg',
      brand: 'Lays',
      sale_price: 5,
      purchase_price: 2,
      category_id: categoryIds.Papas,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      SKU: 'SKU-003',
      name: 'Leche Pil 1L',
      description: 'Leche entera en envase Tetra Pak',
      image: 'https://pilandina.com.bo/wp-content/uploads/2019/06/Leche-caja-1.webp',
      brand: 'Pil',
      sale_price: 8,
      purchase_price: 6,
      category_id: categoryIds.Lacteos,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    }
  ]);
};
