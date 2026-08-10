exports.seed = async function(knex) {
  await knex('category').del();

  await knex('category').insert([
    { name: 'Chaquetas hombres', description: 'Chaquetas para hombres', image: "https://img.magnific.com/vector-premium/coleccion-varias-chaquetas-prendas-abrigo-hombre_1057439-891.jpg?semt=ais_hybrid&w=740&q=80" },
    { name: 'Poleras unisex', description: 'Poleras para uso unisex', image: 'https://img.magnific.com/vector-gratis/coleccion-camisetas-diferentes-colores-2d_23-2147832288.jpg?semt=ais_hybrid&w=740&q=80' }
  ]);
};
