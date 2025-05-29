// src/seeds/06_seed_categories.js
exports.seed = async function(knex) {
  await knex('category').del();

  await knex('category').insert([
    { name: 'Bebes', description: 'Ropa para bebes', image: 'https://desydes.com/wp-content/uploads/2023/01/White-Neutral-Cute-Baby-Bath-With-Towel-Organic-Baby-Product-Facebook-Post.jpg' },
    { name: 'Bebidas', description: 'Gaseosas, jugos y agua', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSZkZPrTm3uG2KS5kzcs1oUIdHseNpVbJWtbw&s' },
    { name: 'Papas', description: 'Papas fritas', image: 'https://m.media-amazon.com/images/I/81mABE1sNhL.jpg' }
  ]);
};
