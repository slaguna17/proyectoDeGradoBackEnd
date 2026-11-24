exports.seed = async function(knex) {
  await knex('store').del();

  await knex('store').insert([
    {
      name: 'AURA',
      address: 'Cañada Strongest, San Pedro',
      city: 'La Paz',
      logo: 'stores/media_1795315945451_a12179c1.jpg',
      history: 'Tienda de moda y prendas seleccionadas con estilo y comodidad para toda ocasión.',
      phone: '76742300'
    }
  ]);
};
