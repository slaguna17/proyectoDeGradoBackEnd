const db = require('../config/db');
const dayjs = require('dayjs');

const createError = (message, status, code, details) => {
  const error = new Error(message);
  error.status = status;
  if (code) error.code = code;
  if (details) error.details = details;
  return error;
};

const normalizeText = (value, fallback = null) => {
  if (value == null) return fallback;
  const normalized = String(value).trim().toLowerCase();
  return normalized || fallback;
};

const normalizeSaleItem = (item, index) => {
  const productId = Number(item.product_id);
  const quantity = Number(item.quantity);
  const unitPrice = Number(item.unit_price);
  const details = {
    cartItemId: item.id || null,
    index,
    product_id: item.product_id,
    quantity: item.quantity,
    unit_price: item.unit_price
  };

  if (!Number.isSafeInteger(productId) || productId <= 0) {
    throw createError('Cart item has an invalid product id.', 400, 'INVALID_CART_ITEM', details);
  }

  if (!Number.isSafeInteger(quantity) || quantity <= 0) {
    throw createError('Cart item has an invalid quantity.', 400, 'INVALID_CART_ITEM', details);
  }

  if (
    item.unit_price == null ||
    String(item.unit_price).trim() === '' ||
    !Number.isFinite(unitPrice) ||
    unitPrice < 0
  ) {
    throw createError('Cart item has an invalid unit price.', 400, 'INVALID_CART_ITEM', details);
  }

  return {
    id: item.id,
    product_id: productId,
    quantity,
    unit_price: unitPrice
  };
};

const ShoppingCartModel = {
  
  createCart: async (cartData, items) => {
    return await db.transaction(async (trx) => {
      const [cart] = await trx('shopping_cart').insert(cartData).returning('*');

      if (items && items.length > 0) {
        const itemsToInsert = items.map(item => ({
          shopping_cart_id: cart.id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price
        }));
        await trx('cart_item').insert(itemsToInsert);
      }

      return cart;
    });
  },

  getCartsByStore: async (storeId) => {
    const carts = await db('shopping_cart')
      .where({ store_id: storeId, status: 'pending' })
      .orderBy('created_at', 'desc');

    // Hydrate items for each cart
    for (const cart of carts) {
      cart.items = await db('cart_item as ci')
        .join('product as p', 'ci.product_id', 'p.id')
        .where('ci.shopping_cart_id', cart.id)
        .select(
          'ci.id', 
          'ci.quantity', 
          'ci.unit_price', 
          'p.name as product_name', 
          'p.image as product_image',
          'p.id as product_id',
          'p.SKU'
        );
    }
    return carts;
  },

  getCartById: async (id) => {
    const cart = await db('shopping_cart').where({ id }).first();
    if (!cart) return null;

    cart.items = await db('cart_item as ci')
      .join('product as p', 'ci.product_id', 'p.id')
      .where('ci.shopping_cart_id', id)
      .select('ci.*', 'p.name as product_name', 'p.SKU', 'p.image as product_image');
    
    return cart;
  },

  // Update Items
  updateCartItems: async (cartId, newItems) => {
    return await db.transaction(async (trx) => {
      const cart = await trx('shopping_cart')
        .where({ id: cartId })
        .forUpdate()
        .first();

      if (!cart) {
        throw createError('Cart not found', 404, 'CART_NOT_FOUND');
      }

      if (normalizeText(cart.status) === 'completed') {
        throw createError('Completed carts cannot be updated', 409, 'CART_ALREADY_COMPLETED');
      }

      await trx('cart_item').where({ shopping_cart_id: cartId }).del();

      const itemsToInsert = newItems.map(item => ({
        shopping_cart_id: cartId,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price
      }));
      await trx('cart_item').insert(itemsToInsert);

      // Recalculate total
      const total = itemsToInsert.reduce((acc, item) => acc + (Number(item.quantity) * Number(item.unit_price)), 0);
      await trx('shopping_cart').where({ id: cartId }).update({ total_estimated: total });

      return true;
    });
  },

  deleteCart: async (id) => {
    return await db.transaction(async (trx) => {
      const cart = await trx('shopping_cart')
        .where({ id })
        .forUpdate()
        .first();

      if (!cart) {
        throw createError('Cart not found', 404, 'CART_NOT_FOUND');
      }

      if (normalizeText(cart.status) === 'completed') {
        throw createError('Completed carts cannot be deleted', 409, 'CART_ALREADY_COMPLETED');
      }

      return trx('shopping_cart').where({ id }).del();
    });
  },

  finalizeCartToSale: async (cartId, userId, paymentMethod) => {
    return await db.transaction(async (trx) => {
      const cart = await trx('shopping_cart')
        .where({ id: cartId })
        .forUpdate()
        .first();

      if (!cart) throw createError('Cart not found', 404, 'CART_NOT_FOUND');

      const cartStatus = normalizeText(cart.status, 'pending');
      if (cartStatus === 'completed') {
        throw createError('Cart already finalized', 409, 'CART_ALREADY_COMPLETED');
      }
      if (cartStatus !== 'pending') {
        throw createError('Only pending carts can be finalized', 409, 'CART_NOT_PENDING', { status: cart.status });
      }

      const items = await trx('cart_item').where({ shopping_cart_id: cartId });
      if (items.length === 0) throw createError('Cart is empty', 400, 'EMPTY_CART');
      const normalizedItems = items.map(normalizeSaleItem);

      const today = dayjs().format('YYYY-MM-DD');

      const cashSession = await trx('cash_session')
        .where({ store_id: cart.store_id, opened_on: today, status: 'open' })
        .first();
      
      if (!cashSession) {
        throw createError('There is not an opened cashbox session to register the sale.', 409, 'CASH_SESSION_NOT_OPEN');
      }

      const totalSale = normalizedItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
      const normalizedPaymentMethod = normalizeText(paymentMethod, 'cash');
      const requestedByProduct = new Map();

      for (const item of normalizedItems) {
        requestedByProduct.set(item.product_id, (requestedByProduct.get(item.product_id) || 0) + item.quantity);
      }

      for (const [productId, requestedQuantity] of requestedByProduct.entries()) {
        const inventoryRow = await trx('store_product')
          .where({ store_id: cart.store_id, product_id: productId })
          .forUpdate()
          .first();

        if (!inventoryRow) {
          throw createError('The product does not exist in the inventory of this store.', 404, 'PRODUCT_NOT_FOUND_IN_STORE_INVENTORY', {
            storeId: cart.store_id,
            productId
          });
        }

        const availableStock = Number(inventoryRow.stock);
        if (availableStock < requestedQuantity) {
          throw createError('Insufficient stock for this product in the store.', 409, 'INSUFFICIENT_STOCK', {
            storeId: cart.store_id,
            productId,
            availableStock,
            requestedQuantity,
            missingQuantity: requestedQuantity - availableStock
          });
        }
      }

      const [newSale] = await trx('sales').insert({
        user_id: userId, // User confirms sale in Android
        store_id: cart.store_id,
        total: totalSale,
        sale_date: new Date(),
        payment_method: normalizedPaymentMethod,
        status: 'completed',
        notes: `Venta WhatsApp - Cliente: ${cart.customer_name || cart.customer_phone} (Ref #${cart.id})`
      }).returning('*');

      for (const item of normalizedItems) {
        await trx('sales_product').insert({
          sales_id: newSale.id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price
        });
      }

      for (const [productId, requestedQuantity] of requestedByProduct.entries()) {
        const affectedRows = await trx('store_product')
          .where({ store_id: cart.store_id, product_id: productId })
          .where('stock', '>=', requestedQuantity)
          .decrement('stock', requestedQuantity);

        if (!affectedRows) {
          throw createError('Insufficient stock for this product in the store.', 409, 'INSUFFICIENT_STOCK', {
            storeId: cart.store_id,
            productId,
            requestedQuantity
          });
        }
      }

      await trx('cash_movement').insert({
        store_id: cart.store_id,
        cash_session_id: cashSession.id,
        user_id: userId,
        direction: 'IN',
        amount: totalSale,
        origin_type: 'SALE',
        origin_id: newSale.id,
        category: 'Venta WhatsApp',
        notes: `Cobro de pedido reservado`
      });

      await trx('shopping_cart').where({ id: cartId }).update({ status: 'completed' });

      return newSale;
    });
  }
};

module.exports = ShoppingCartModel;
