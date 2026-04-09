const db = require('../config/db');

const InventoryModel = {
  getStock: async (storeId, productId) => {
    return await db('store_product')
      .where({ store_id: storeId, product_id: productId })
      .select('stock', 'expiration_date')
      .first();
  },

  updateStock: async (storeId, productId, { stock, expiration_date = null, hasExpirationDate = false }) => {
    const exists = await db('store_product')
      .where({ store_id: storeId, product_id: productId })
      .first();

    if (exists) {
      const updateData = {
        stock,
        updated_at: db.fn.now()
      };

      if (hasExpirationDate) {
        updateData.expiration_date = expiration_date;
      }

      await db('store_product')
        .where({ store_id: storeId, product_id: productId })
        .update(updateData);
    } else {
      await db('store_product').insert({
        store_id: storeId,
        product_id: productId,
        stock,
        expiration_date: hasExpirationDate ? expiration_date : null,
        created_at: db.fn.now(),
        updated_at: db.fn.now()
      });
    }

    return await db('store_product')
      .where({ store_id: storeId, product_id: productId })
      .select('store_id', 'product_id', 'stock', 'expiration_date')
      .first();
  }
};

module.exports = InventoryModel;