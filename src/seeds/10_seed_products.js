exports.seed = async function (knex) {
  await knex('product').del();

  const categories = await knex('category').select('id', 'name');
  const cat = Object.fromEntries(categories.map(({ id, name }) => [name, id]));

  const requiredCategories = [
    'Sudaderas y Canguros',
    'Vestidos',
    'Suéteres y Chompas'
  ];

  for (const rc of requiredCategories) {
    if (!cat[rc]) {
      throw new Error(`Required category "${rc}" was not found. Check 06_seed_categories.js.`);
    }
  }

  await knex('product').insert([
    // --- 1. Sudadera Nike (Sudaderas y Canguros) ---
    {
      SKU: 'AURA-SUD-001',
      name: 'Sudadera Nike Guinda',
      description: 'Sudadera de algodón guinda nike',
      image: 'products/media_1795399388352_a37b10c1.jpg',
      brand: 'Nike',
      sale_price: 380.00,
      purchase_price: 220.00,
      min_stock: 3,
      category_id: cat['Sudaderas y Canguros'],
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },

    // --- 2. Vestido a Rayas (Vestidos) ---
    {
      SKU: 'AURA-VES-001',
      name: 'Vestido casual a rayas blanco y negro',
      description: 'Vestido corto entallado sin mangas blanco y negro',
      image: 'products/media_1795399425709_a0880883.jpg',
      brand: 'AURA',
      sale_price: 180.00,
      purchase_price: 95.00,
      min_stock: 2,
      category_id: cat['Vestidos'],
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },

    // --- 3. Chompa Stitch (Suéteres y Chompas) ---
    {
      SKU: 'AURA-SUE-001',
      name: 'Chompa Navideña Tejida Stitch Azul',
      description: 'Suéter de punto tejido estampado de Stitch.',
      image: 'products/media_1795399487296_222f895a.png',
      brand: 'Disney',
      sale_price: 240.00,
      purchase_price: 130.00,
      min_stock: 3,
      category_id: cat['Suéteres y Chompas'],
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    }
  ]);
};
