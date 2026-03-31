const db = require('../config/db');
const dayjs = require('dayjs');

const SalesModel = {
  registerSale: async (saleData) => {
    const { user_id, store_id, payment_method, notes, products } = saleData;

    if (!products || products.length === 0) {
      const err = new Error('A sale must have at least one product.');
      err.status = 400;
      err.code = 'EMPTY_SALE_PRODUCTS';
      throw err;
    }

    return db.transaction(async trx => {
      const today = dayjs().format('YYYY-MM-DD');

      const cashSession = await trx('cash_session')
        .where({ store_id, opened_on: today, status: 'open' })
        .first();

      if (!cashSession) {
        const err = new Error('There is not an opened cashbox session to register the sale.');
        err.status = 409;
        err.code = 'CASH_SESSION_NOT_OPEN';
        throw err;
      }

      /*
       * Agrupar productos repetidos por si el frontend enviara el mismo producto
       * más de una vez en el arreglo products.
       */
      const groupedProductsMap = new Map();

      for (const product of products) {
        const productId = Number(product.product_id);
        const quantity = Number(product.quantity);
        const unitPrice = Number(product.unit_price);

        if (!productId || !quantity || quantity <= 0 || Number.isNaN(unitPrice)) {
          const err = new Error('Invalid sale product data.');
          err.status = 400;
          err.code = 'INVALID_SALE_PRODUCT';
          throw err;
        }

        if (groupedProductsMap.has(productId)) {
          const existing = groupedProductsMap.get(productId);
          groupedProductsMap.set(productId, {
            ...existing,
            quantity: existing.quantity + quantity
          });
        } else {
          groupedProductsMap.set(productId, {
            product_id: productId,
            quantity,
            unit_price: unitPrice
          });
        }
      }

      const groupedProducts = Array.from(groupedProductsMap.values());

      /*
       * VALIDAR STOCK ANTES de insertar la venta y ANTES de descontar inventario.
       */
      for (const product of groupedProducts) {
        const inventoryRow = await trx('store_product as sp')
          .join('product as p', 'sp.product_id', 'p.id')
          .select(
            'sp.store_id',
            'sp.product_id',
            'sp.stock',
            'p.name'
          )
          .where({
            'sp.store_id': store_id,
            'sp.product_id': product.product_id
          })
          .first();

        if (!inventoryRow) {
          const err = new Error('The product does not exist in the inventory of this store.');
          err.status = 404;
          err.code = 'PRODUCT_NOT_FOUND_IN_STORE_INVENTORY';
          err.details = {
            storeId: store_id,
            productId: product.product_id
          };
          throw err;
        }

        const availableStock = Number(inventoryRow.stock);
        const requestedQuantity = Number(product.quantity);
        const missingQuantity = requestedQuantity - availableStock;

        if (availableStock < requestedQuantity) {
          const err = new Error('Insufficient stock for this product in the store.');
          err.status = 409;
          err.code = 'INSUFFICIENT_STOCK';
          err.details = {
            storeId: store_id,
            productId: product.product_id,
            productName: inventoryRow.name,
            availableStock,
            requestedQuantity,
            missingQuantity
          };
          throw err;
        }
      }

      const total = groupedProducts.reduce(
        (sum, p) => sum + Number(p.unit_price) * Number(p.quantity),
        0
      );

      const [sale] = await trx('sales')
        .insert({
          store_id,
          user_id,
          total,
          sale_date: trx.fn.now(),
          payment_method,
          status: 'completed',
          notes: notes || ''
        })
        .returning('*');

      for (const product of groupedProducts) {
        await trx('sales_product').insert({
          sales_id: sale.id,
          product_id: product.product_id,
          quantity: product.quantity,
          unit_price: product.unit_price
        });

        await trx('store_product')
          .where({
            store_id,
            product_id: product.product_id
          })
          .decrement('stock', product.quantity);
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