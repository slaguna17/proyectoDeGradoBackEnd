exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex('product').del();

  // Inserts seed entries
  await knex('product').insert([
    {
      SKU: 'SKU-001',
      name: 'Coca Cola 2L',
      description: 'Botella de gaseosa de 2 litros',
      image: null,
      brand: 'Coca Cola',
      category_id: 1, // Bebidas
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      SKU: 'SKU-002',
      name: 'Papas Lays Clásicas',
      description: 'Bolsa de papas fritas',
      image: null,
      brand: 'Lays',
      category_id: 2, // Snacks
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      SKU: 'SKU-003',
      name: 'Leche Pil 1L',
      description: 'Leche entera en envase Tetra Pak',
      image: null,
      brand: 'Pil',
      category_id: 3, // Lácteos
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    }
  ]);
};
