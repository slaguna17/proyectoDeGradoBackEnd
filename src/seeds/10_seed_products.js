exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex('product').del();

  // Inserts seed entries
  await knex('product').insert([
    {
      SKU: 'SKU-001',
      name: 'Coca Cola 2L',
      description: 'Botella de gaseosa de 2 litros',
      image: 'https://fsa.bo/productos/01658-01.jpg',
      brand: 'Coca Cola',
      category_id: 2, // Bebidas
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      SKU: 'SKU-002',
      name: 'Papas Lays Clásicas',
      description: 'Bolsa de papas fritas',
      image: 'https://m.media-amazon.com/images/I/8141nrQe0aL.jpg',
      brand: 'Lays',
      category_id: 3, // Snacks
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      SKU: 'SKU-003',
      name: 'Leche Pil 1L',
      description: 'Leche entera en envase Tetra Pak',
      image: 'https://pilandina.com.bo/wp-content/uploads/2019/06/Leche-caja-1.webp',
      brand: 'Pil',
      category_id: 1, // Lácteos
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    }
  ]);
};
