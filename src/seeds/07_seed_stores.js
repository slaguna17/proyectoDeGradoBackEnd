exports.seed = async function(knex) {
  await knex('store').del();

  await knex('store').insert([
    {
      name: 'Aura',
      address: 'Cañada Strongest, San Pedro',
      city: 'La Paz',
      logo: null,
      history: 'Tienda con la ropa que cumple tus necesidades',
      phone: '76742300'
    }
  ]);
};
