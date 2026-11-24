exports.seed = async function (knex) {
  // Clear any existing sales data
  await knex('sales_product').del();
  await knex('sales').del();

  const store = await knex('store')
    .select('id')
    .whereRaw('LOWER(name) = ?', ['aura'])
    .first();

  if (!store) {
    throw new Error('Store AURA was not found. Check 07_seed_stores.js.');
  }

  const users = await knex('user').select('id', 'email');
  if (users.length === 0) {
    throw new Error('No users found to associate with sales. Check 03_seed_users.js.');
  }

  const products = await knex('product').select('id', 'sale_price', 'name');
  if (products.length === 0) {
    throw new Error('No products found to generate sales transactions. Check 10_seed_products.js.');
  }

  // Linear Congruential Generator for reproducible, organic pseudo-randomness
  let seed = 456789123;
  function prng() {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  }

  // Organic boutique volume: 67 transactions across 84 days (~12 weeks)
  const TOTAL_SALES = 67;
  const SPAN_DAYS = 84;
  const DAY_MS = 24 * 60 * 60 * 1000;
  const now = Date.now();
  const startTime = now - (SPAN_DAYS * DAY_MS);

  // Local payment methods realistic in La Paz, Bolivia
  const paymentMethods = [
    { method: 'cash', weight: 0.44 },
    { method: 'qr', weight: 0.36 },
    { method: 'card', weight: 0.15 },
    { method: 'transfer', weight: 0.05 }
  ];

  function pickPaymentMethod() {
    const r = prng();
    let acc = 0;
    for (const pm of paymentMethods) {
      acc += pm.weight;
      if (r <= acc) return pm.method;
    }
    return 'cash';
  }

  const notesList = [
    'Venta en tienda',
    'Venta mostrador AURA',
    'Cliente habitual',
    'Venta turno tarde',
    'Venta fin de semana',
    'Consulta por vitrina'
  ];

  const allSalesPlan = [];

  for (let i = 0; i < TOTAL_SALES; i++) {
    const dayProgress = (i / TOTAL_SALES) * SPAN_DAYS;
    const hour = 10 + Math.floor(prng() * 10);
    const minute = Math.floor(prng() * 60);
    const second = Math.floor(prng() * 60);

    const saleTimestamp = new Date(
      startTime + (dayProgress * DAY_MS) + (hour * 3600000) + (minute * 60000) + (second * 1000)
    );

    const user = users[Math.floor(prng() * users.length)];

    // Number of distinct products in the sale: 1 (82%), 2 (18%)
    const roll = prng();
    const itemCount = roll < 0.82 ? 1 : Math.min(2, products.length);

    // Shuffle and pick unique products for this sale
    const shuffledProducts = [...products].sort(() => prng() - 0.5);
    const saleItems = [];
    let saleTotal = 0;

    for (let j = 0; j < itemCount; j++) {
      const prod = shuffledProducts[j];
      // Quantity per line item: 1 (88%), 2 (12%)
      const qRoll = prng();
      const qty = qRoll < 0.88 ? 1 : 2;
      const unitPrice = Number(prod.sale_price);
      saleTotal += qty * unitPrice;

      saleItems.push({
        product_id: prod.id,
        quantity: qty,
        unit_price: unitPrice
      });
    }

    const roundedTotal = Math.round(saleTotal * 100) / 100;
    const paymentMethod = pickPaymentMethod();
    // 97% completed, 3% pending
    const status = prng() < 0.97 ? 'completed' : 'pending';
    const notes = notesList[Math.floor(prng() * notesList.length)];

    allSalesPlan.push({
      sale: {
        store_id: store.id,
        user_id: user.id,
        total: roundedTotal,
        sale_date: saleTimestamp,
        payment_method: paymentMethod,
        status: status,
        notes: notes,
        created_at: saleTimestamp,
        updated_at: saleTimestamp
      },
      items: saleItems
    });
  }

  // Insert in batches
  const CHUNK_SIZE = 50;
  for (let c = 0; c < allSalesPlan.length; c += CHUNK_SIZE) {
    const chunk = allSalesPlan.slice(c, c + CHUNK_SIZE);
    const salesRows = chunk.map(entry => entry.sale);

    const insertedRows = await knex('sales')
      .insert(salesRows)
      .returning('id');

    const salesProductRows = [];
    for (let k = 0; k < insertedRows.length; k++) {
      const row = insertedRows[k];
      const saleId = typeof row === 'object' && row !== null ? row.id : row;
      const items = chunk[k].items;

      for (const item of items) {
        salesProductRows.push({
          sales_id: saleId,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          created_at: chunk[k].sale.created_at,
          updated_at: chunk[k].sale.updated_at
        });
      }
    }

    if (salesProductRows.length > 0) {
      await knex.batchInsert('sales_product', salesProductRows, 100);
    }
  }
};
