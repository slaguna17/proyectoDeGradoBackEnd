exports.seed = async function (knex) {
  // Clear any existing purchases data
  await knex('purchase_product').del();
  await knex('purchase').del();

  const store = await knex('store')
    .select('id')
    .whereRaw('LOWER(name) = ?', ['aura'])
    .first();

  if (!store) {
    throw new Error('Store AURA was not found. Check 07_seed_stores.js.');
  }

  const users = await knex('user').select('id', 'email');
  if (users.length === 0) {
    throw new Error('No users found to associate with purchases. Check 03_seed_users.js.');
  }

  const providers = await knex('provider').select('id', 'name');
  if (providers.length === 0) {
    throw new Error('No providers found. Check 09_seed_providers.js.');
  }

  const products = await knex('product').select('id', 'purchase_price', 'name', 'SKU');
  if (products.length === 0) {
    throw new Error('No products found. Check 10_seed_products.js.');
  }

  // PRNG with fixed seed for consistent organic generation
  let seed = 987654321;
  function prng() {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  }

  // Map products to provider (Textil Norte for Nike, Moda Andina for others)
  const provider1 = providers.find(p => p.name.includes('Textil Norte')) || providers[0];
  const provider2 = providers.find(p => p.name.includes('Moda Andina')) || providers[1 % providers.length];

  const TOTAL_PURCHASES = 22;
  const SPAN_DAYS = 84;
  const DAY_MS = 24 * 60 * 60 * 1000;
  const now = Date.now();
  const startTime = now - (SPAN_DAYS * DAY_MS);

  const paymentMethods = [
    { method: 'transfer', weight: 0.60 },
    { method: 'cash', weight: 0.25 },
    { method: 'qr', weight: 0.15 }
  ];

  function pickPaymentMethod() {
    const r = prng();
    let acc = 0;
    for (const pm of paymentMethods) {
      acc += pm.weight;
      if (r <= acc) return pm.method;
    }
    return 'transfer';
  }

  const notesList = [
    'Reposición de stock quincenal',
    'Pedido de lote nueva temporada',
    'Reabastecimiento prendas alta rotación',
    'Pedido por vitrina y tallas agotadas',
    'Lote especial prendas de abrigo'
  ];

  const allPurchasesPlan = [];

  for (let i = 0; i < TOTAL_PURCHASES; i++) {
    const dayProgress = (i / TOTAL_PURCHASES) * (SPAN_DAYS - 1);
    const hour = 9 + Math.floor(prng() * 9); // between 9:00 and 17:00
    const minute = Math.floor(prng() * 60);
    const second = Math.floor(prng() * 60);

    const purchaseTimestamp = new Date(
      startTime + (dayProgress * DAY_MS) + (hour * 3600000) + (minute * 60000) + (second * 1000)
    );

    const user = users[Math.floor(prng() * users.length)];

    // Alternate between provider1 and provider2
    const chosenProvider = (i % 2 === 0) ? provider1 : provider2;

    // Filter available products for this provider
    let providerProducts = products.filter(p => {
      if (chosenProvider.id === provider1.id) {
        return p.SKU === 'AURA-SUD-001';
      } else {
        return p.SKU !== 'AURA-SUD-001';
      }
    });

    if (providerProducts.length === 0) {
      providerProducts = products;
    }

    // Pick 1 or 2 products
    const itemCount = Math.min(prng() < 0.65 ? 1 : 2, providerProducts.length);
    const shuffled = [...providerProducts].sort(() => prng() - 0.5);
    const purchaseItems = [];
    let purchaseTotal = 0;

    for (let j = 0; j < itemCount; j++) {
      const prod = shuffled[j];
      // Quantity for restocking: 3 to 8 units
      const qty = 3 + Math.floor(prng() * 6);
      const unitPrice = Number(prod.purchase_price) || 100.0;
      purchaseTotal += qty * unitPrice;

      purchaseItems.push({
        product_id: prod.id,
        quantity: qty,
        unit_price: unitPrice
      });
    }

    const roundedTotal = Math.round(purchaseTotal * 100) / 100;
    const paymentMethod = pickPaymentMethod();
    const status = 'received';
    const notes = notesList[Math.floor(prng() * notesList.length)];

    allPurchasesPlan.push({
      purchase: {
        store_id: store.id,
        user_id: user.id,
        provider_id: chosenProvider.id,
        total: roundedTotal,
        purchase_date: purchaseTimestamp,
        payment_method: paymentMethod,
        status: status,
        notes: notes,
        created_at: purchaseTimestamp,
        updated_at: purchaseTimestamp
      },
      items: purchaseItems
    });
  }

  // Insert in chunks
  const CHUNK_SIZE = 50;
  for (let c = 0; c < allPurchasesPlan.length; c += CHUNK_SIZE) {
    const chunk = allPurchasesPlan.slice(c, c + CHUNK_SIZE);
    const purchaseRows = chunk.map(entry => entry.purchase);

    const insertedRows = await knex('purchase')
      .insert(purchaseRows)
      .returning('id');

    const purchaseProductRows = [];
    for (let k = 0; k < insertedRows.length; k++) {
      const row = insertedRows[k];
      const purchaseId = typeof row === 'object' && row !== null ? row.id : row;
      const items = chunk[k].items;

      for (const item of items) {
        purchaseProductRows.push({
          purchase_id: purchaseId,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          created_at: chunk[k].purchase.created_at,
          updated_at: chunk[k].purchase.updated_at
        });
      }
    }

    if (purchaseProductRows.length > 0) {
      await knex('purchase_product').insert(purchaseProductRows);
    }
  }

  console.log(`Successfully seeded ${allPurchasesPlan.length} purchases for store AURA.`);
};
