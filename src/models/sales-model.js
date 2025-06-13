const db = require('../config/db');

const SalesModel = {
  registerSale: async ({ store_id, user_id, products, payment_method }) => {
    return await db.transaction(async trx => {
      const sale_total = products.reduce((sum, p) => sum + p.unit_price * p.quantity, 0);

      const [salesBox] = await trx('sales_box')
        .insert({
          store_id,
          user_id,
          total: sale_total,
          sales_count: 1,
          date: trx.fn.now(),
          created_at: trx.fn.now(),
          updated_at: trx.fn.now()
        })
        .returning('*');

      const [sale] = await trx('sales')
        .insert({
          store_id,
          user_id,
          sales_box_id: salesBox.id,
          total: sale_total,
          sale_date: trx.fn.now(),
          payment_method,
          status: 'completed',
          notes: '',
          created_at: trx.fn.now(),
          updated_at: trx.fn.now()
        })
        .returning('*');

      const saleDetails = products.map(p => ({
        sales_id: sale.id,
        product_id: p.product_id,
        quantity: p.quantity,
        unit_price: p.unit_price
      }));

      await trx('sales_product').insert(saleDetails);

      return sale;
    });
  },

  getAllSales: async () => {
    return await db('sales').select('*');
  },

  getSaleById: async (id) => {
    const sale = await db('sales').where({ id }).first();
    const details = await db('sales_product')
      .join('product', 'sales_product.product_id', 'product.id')
      .select('product.name', 'sales_product.quantity', 'sales_product.unit_price')
      .where('sales_product.sales_id', id);
    return { ...sale, products: details };
  },

  getSalesByStore: async (storeId) => {
    return await db('sales').where({ store_id: storeId });
  },

  getSalesByUser: async (userId) => {
    return await db('sales').where({ user_id: userId });
  },

  updateSale: async (id, { products, payment_method }) => {
    return await db.transaction(async trx => {
      await trx('sales_product').where({ sales_id: id }).del();

      const [updated] = await trx('sales')
        .where({ id })
        .update({ payment_method, updated_at: trx.fn.now() })
        .returning('*');

      const newDetails = products.map(p => ({
        sales_id: id,
        product_id: p.product_id,
        quantity: p.quantity,
        unit_price: p.unit_price
      }));
      await trx('sales_product').insert(newDetails);

      return updated;
    });
  },

  deleteSale: async (id) => {
    return await db.transaction(async trx => {
      await trx('sales_product').where({ sales_id: id }).del();
      await trx('sales').where({ id }).del();
    });
  }
};

module.exports = SalesModel;
