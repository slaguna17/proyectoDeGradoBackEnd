// src/seeds/07_seed_stores.js
exports.seed = async function(knex) {
  await knex('store').del();

  await knex('store').insert([
    {
      name: 'Juan del Sur',
      address: 'Irpavi calle 10 Av. Vera',
      city: 'La Paz',
      logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSL0MrKSYCRLUXUZAuoCedxZ8Jw_-VD0fw9WA&s',
      history: 'Fundada en 2010, orientada al autoservicio.',
      phone: '72000001'
    },
    {
      name: 'MiniMarket El Vecino',
      address: 'Obrajes',
      city: 'Cochabamba',
      logo: 'https://verdadcontinta.com/wp-content/uploads/2020/08/WhatsApp-Image-2020-08-12-at-18.54.27-1024x610.jpeg',
      history: 'Pequeña tienda familiar en expansión.',
      phone: '77000002'
    }
  ]);
};
