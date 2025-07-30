// src/seeds/06_seed_categories.js
exports.seed = async function(knex) {
  await knex('category').del();

  await knex('category').insert([
    { name: 'Lacteos', description: 'Productos lacteos', image: 'https://thefoodtech.com/wp-content/uploads/2021/08/lacteos-scaled.jpg' },
    { name: 'Bebidas', description: 'Gaseosas, jugos y agua', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSZkZPrTm3uG2KS5kzcs1oUIdHseNpVbJWtbw&s' },
    { name: 'Papas', description: 'Papas fritas', image: 'https://m.media-amazon.com/images/I/81mABE1sNhL.jpg' }
  ]);
};
