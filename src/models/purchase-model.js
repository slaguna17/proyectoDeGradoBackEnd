const db = require('../config/db');

const PurchaseModel = {
  registerPurchase: async ({ store_id, user_id, provider_id, products, notes, purchase_date }) => {
    return await db.transaction(async trx => {
      const total = products.reduce((sum, p) => sum + p.unit_price * p.quantity, 0);

      const [purchase] = await trx('purchase')
        .insert({ store_id, user_id, provider_id, total, notes, purchase_date, created_at: trx.fn.now(), updated_at: trx.fn.now() })
        .returning('*');

      const purchaseDetails = products.map(p => ({ purchase_id: purchase.id, product_id: p.product_id, quantity: p.quantity, unit_price: p.unit_price }));

      await trx('purchase_product').insert(purchaseDetails);

      await trx('purchase_box').insert({ store_id, user_id, total, purchases_count: 1, purchase_date, created_at: trx.fn.now(), updated_at: trx.fn.now() });

      return purchase;
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