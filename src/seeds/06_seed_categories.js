exports.seed = async function(knex) {
  await knex('category').del();

  await knex('category').insert([
    {
      name: 'Sudaderas y Canguros',
      description: 'Sudaderas deportivas, canguros urbanos y buzos con capucha',
      image: 'products/media_1795399388352_a37b10c1.jpg'
    },
    {
      name: 'Vestidos',
      description: 'Vestidos casuales, de fiesta y temporada para mujer',
      image: 'products/media_1795399425709_a0880883.jpg'
    },
    {
      name: 'Suéteres y Chompas',
      description: 'Chompas tejidas de punto, suéteres temáticos y prendas de abrigo',
      image: 'products/media_1795399487296_222f895a.png'
    }
  ]);
};
