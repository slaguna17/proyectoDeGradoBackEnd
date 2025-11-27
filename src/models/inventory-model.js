const db = require('../config/db');

const InventoryModel = {
  getStock: async (storeId, productId) => {
    return await db('store_product')
      .where({ store_id: storeId, product_id: productId })
      .select('stock')
      .first();
  },

  updateStock: async (storeId, productId, stock) => {
    const exists = await db('store_product')
      .where({ store_id: storeId, product_id: productId })
      .first();

    if (exists) {
      await db('store_product')
        .where({ store_id: storeId, product_id: productId })
        .update({ stock, updated_at: db.fn.now() });
    } else {
      await db('store_product').insert({
        store_id: storeId,
        product_id: productId,
        stock,
        created_at: db.fn.now(),
        updated_at: db.fn.now()
      });
    }

    return await db('store_product')
      .where({ store_id: storeId, product_id: productId })
      .first();
  }
};

module.exports = InventoryModel;