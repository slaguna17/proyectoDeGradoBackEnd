const db = require('../config/db');
const dayjs = require('dayjs');

const SalesModel = {
  registerSale: async (saleData) => {
    const { user_id, store_id, payment_method, notes, products } = saleData;

    // Check products
    if (!products || products.length === 0) {
      throw new Error('A sale must have at least one product.');
    }

    //Begin transaction to ensure data integrity
    return db.transaction(async trx => {
      const today = dayjs().format('YYYY-MM-DD');
      const cashSession = await trx('cash_session')
        .where({ store_id, opened_on: today, status: 'open' })
        .first();

      if (!cashSession) {
        // Sale can't be registered if there is not an opened cashbox
        const err = new Error('There is not an opened cashbox session to register the sale.');
        err.status = 409;
        throw err;
      }
      
      const total = products.reduce((sum, p) => sum + p.unit_price * p.quantity, 0);

      const [sale] = await trx('sales')
        .insert({
          store_id,
          user_id,
          total,
          sale_date: trx.fn.now(),
          payment_method,
          status: 'completed',
          notes: notes || '',
        })
        .returning('*');

      // Manage inventory
      for (const product of products) {
        await trx('sales_product').insert({
          sales_id: sale.id,
          product_id: product.product_id,
          quantity: product.quantity,
          unit_price: product.unit_price
        });

        // Decrease stock in selected store
        const updatedRows = await trx('store_product')
          .where({ store_id, product_id: product.product_id })
          .decrement('stock', product.quantity);
        
        if (updatedRows === 0) {
          throw new Error(`El producto con ID ${product.product_id} no existe en el inventario de esta tienda.`);
        }
      }

      await trx('cash_movement').insert({
        store_id,
        cash_session_id: cashSession.id,
        user_id,
        direction: 'IN',
        amount: total,
        category: 'Ventas',
        notes: `Ingreso por Venta #${sale.id} (${payment_method})`,
        origin_type: 'SALE',
        origin_id: sale.id
      });

      const saleDetails = await trx('sales_product')
        .where('sales_id', sale.id);

      return { ...sale, products: saleDetails };
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
