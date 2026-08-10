exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex('product').del();

  const categories = await knex('category')
    .select('id', 'name')
    .whereIn('name', ['Chaquetas hombres', 'Poleras unisex']);
  const categoryIds = Object.fromEntries(categories.map(({ id, name }) => [name, id]));

  if (!categoryIds['Chaquetas hombres'] || !categoryIds['Poleras unisex']) {
    throw new Error('Required categories were not found. Check 06_seed_categories.js.');
  }

  // Inserts seed entries
  await knex('product').insert([
    {
      SKU: 'AURA-CHAQ-001',
      name: 'Chaqueta azul oscura hombre',
      description: 'Chaqueta azul oscura para hombre',
      image: 'https://www.thebs.com/es/chaqueta-casual-azul-barba-582596',
      brand: 'Aura',
      sale_price: 550,
      purchase_price: 300,
      category_id: categoryIds['Chaquetas hombres'],
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      SKU: 'AURA-POL-001',
      name: 'Polera verde unisex',
      description: 'Polera verde para uso unisex',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSuZNfvRnURnBROhd2FGZ--wibAA9aV8INdt77JLsWiRrIXd2PBkqaSjigZ&s=10',
      brand: 'Aura',
      sale_price: 150,
      purchase_price: 35,
      category_id: categoryIds['Poleras unisex'],
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    }
  ]);
};
