exports.seed = async function(knex) {
  await knex('provider').del();

  await knex('provider').insert([
    {
      name: 'Distribuidora Textil Norte',
      address: 'Calle Illampu #840, Zona San Pedro',
      phone: '71523490',
      email: 'ventas@textilnorte.bo',
      contact_person_name: 'Gonzalo Morales',
      notes: 'Proveedor de sudaderas deportivas y prendas urbanas'
    },
    {
      name: 'Confecciones & Moda Andina',
      address: 'Av. Tumusla #320, Zona Gran Poder',
      phone: '72049182',
      email: 'contacto@modaandina.bo',
      contact_person_name: 'Elena Mamani',
      notes: 'Proveedor de vestidos y prendas tejidas de temporada'
    }
  ]);
};
