const db = require('../config/db');

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
      await trx('cart_item').where({ shopping_cart_id: cartId }).del();

      if (newItems && newItems.length > 0) {
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
      } else {
        await trx('shopping_cart').where({ id: cartId }).update({ total_estimated: 0 });
      }

      return true;
    });
  },

  deleteCart: async (id) => {
    return await db('shopping_cart').where({ id }).del();
  },

  finalizeCartToSale: async (cartId, userId, paymentMethod) => {
    return await db.transaction(async (trx) => {
      const cart = await trx('shopping_cart').where({ id: cartId }).first();
      if (!cart) throw new Error('Cart not found');
      if (cart.status === 'completed') throw new Error('Cart already finalized');

      const items = await trx('cart_item').where({ shopping_cart_id: cartId });
      if (items.length === 0) throw new Error('Cart is empty');

      const cashSession = await trx('cash_session')
        .where({ store_id: cart.store_id, status: 'open' })
        .first();
      
      if (!cashSession) {
        throw new Error('No hay una caja abierta para esta tienda. Abra caja antes de cobrar.');
      }

      const totalSale = items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unit_price)), 0);

      const [newSale] = await trx('sales').insert({
        user_id: userId, // User confirms sale in Android
        store_id: cart.store_id,
        total: totalSale,
        sale_date: new Date(),
        payment_method: paymentMethod || 'CASH',
        status: 'COMPLETED',
        notes: `Venta WhatsApp - Cliente: ${cart.customer_name || cart.customer_phone} (Ref #${cart.id})`
      }).returning('*');

      for (const item of items) {
        await trx('sales_product').insert({
          sales_id: newSale.id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price
        });

        await trx('store_product')
          .where({ store_id: cart.store_id, product_id: item.product_id })
          .decrement('stock', item.quantity);
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