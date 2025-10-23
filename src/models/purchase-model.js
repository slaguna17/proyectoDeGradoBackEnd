const db = require('../config/db');
const dayjs = require('dayjs');

const PurchaseModel = {
  registerPurchase: async (purchaseData) => {
    const { store_id, user_id, provider_id, notes, products, payment_method } = purchaseData;

    // Check products
    if (!products || products.length === 0) {
      throw new Error('La compra debe tener al menos un producto.');
    }

    // Begin transaction to ensure data integrity
    return db.transaction(async trx => {
      const today = dayjs().format('YYYY-MM-DD');
      const cashSession = await trx('cash_session')
        .where({ store_id, opened_on: today, status: 'open' })
        .first();

      if (!cashSession) {
        // Purchase can't be registered if there is not an opened cashbox
        const err = new Error('There is not an opened cashbox session to register the purchase.');
        err.status = 409;
        throw err;
      }
      
      const total = products.reduce((sum, p) => sum + p.unit_price * p.quantity, 0);

      const [purchase] = await trx('purchase')
        .insert({
          store_id,
          user_id,
          provider_id,
          total,
          notes,
          payment_method,
          status: 'received',
          purchase_date: trx.fn.now()
        })
        .returning('*');

      // Update Inventory
      for (const product of products) {
        await trx('purchase_product').insert({
          purchase_id: purchase.id,
          product_id: product.product_id,
          quantity: product.quantity,
          unit_price: product.unit_price
        });

        // Increase stock
        await trx('store_product')
          .where({ store_id, product_id: product.product_id })
          .increment('stock', product.quantity);
      }
      
      await trx('cash_movement').insert({
        store_id,
        cash_session_id: cashSession.id,
        user_id,
        direction: 'OUT',
        amount: total,
        category: 'Compras',
        notes: `Egreso por Compra #${purchase.id} (${payment_method})`,
        origin_type: 'PURCHASE',
        origin_id: purchase.id
      });

      const purchaseDetails = await trx('purchase_product')
        .where('purchase_id', purchase.id);

      return { ...purchase, products: purchaseDetails };
    });
  },

  getAllPurchases: async () => {
    return await db('purchase').select('*');
  },

  getPurchaseById: async (id) => {
    const purchase = await db('purchase').where({ id }).first();
    const details = await db('purchase_product')
      .join('product', 'purchase_product.product_id', 'product.id')
      .select('product.name', 'purchase_product.quantity', 'purchase_product.unit_price')
      .where('purchase_product.purchase_id', id);
    return { ...purchase, products: details };
  },

  getPurchasesByStore: async (storeId) => {
    return await db('purchase').where({ store_id: storeId });
  },

  getPurchasesByUser: async (userId) => {
    return await db('purchase').where({ user_id: userId });
  },

  getPurchasesByProvider: async (providerId) => {
    return await db('purchase').where({ provider_id: providerId });
  },

  updatePurchase: async (id, { products, notes, provider_id }) => {
    return await db.transaction(async trx => {
      await trx('purchase_product').where({ purchase_id: id }).del();

      const total = products.reduce((sum, p) => sum + p.unit_price * p.quantity, 0);

      const [updated] = await trx('purchase')
        .where({ id })
        .update({ notes, provider_id, total, updated_at: trx.fn.now() })
        .returning('*');

      const newDetails = products.map(p => ({ purchase_id: id, product_id: p.product_id, quantity: p.quantity, unit_price: p.unit_price }));
      await trx('purchase_product').insert(newDetails);

      return updated;
    });
  },

  deletePurchase: async (id) => {
    return await db.transaction(async trx => {
      await trx('purchase_product').where({ purchase_id: id }).del();
      await trx('purchase').where({ id }).del();
    });
  }
};

module.exports = PurchaseModel;