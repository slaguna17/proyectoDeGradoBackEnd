const db = require('../config/db');

const ShoppingCartModel = {
  
  createCart: async (cartData, items) => {
    return await db.transaction(async (trx) => {
      // 1. Insertar Cabecera
      const [cart] = await trx('shopping_cart').insert(cartData).returning('*');

      // 2. Insertar Items
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

  // Obtener carritos por tienda (pendientes)
  getCartsByStore: async (storeId) => {
    const carts = await db('shopping_cart')
      .where({ store_id: storeId, status: 'pending' })
      .orderBy('created_at', 'desc');

    // Hydrate items para cada carrito
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

  // Obtener un carrito específico por ID
  getCartById: async (id) => {
    const cart = await db('shopping_cart').where({ id }).first();
    if (!cart) return null;

    cart.items = await db('cart_item as ci')
      .join('product as p', 'ci.product_id', 'p.id')
      .where('ci.shopping_cart_id', id)
      .select('ci.*', 'p.name as product_name', 'p.SKU', 'p.image as product_image');
    
    return cart;
  },

  // Actualizar items del carrito (Edición por el dueño)
  updateCartItems: async (cartId, newItems) => {
    return await db.transaction(async (trx) => {
      // Borrar items previos y recrear
      await trx('cart_item').where({ shopping_cart_id: cartId }).del();

      if (newItems && newItems.length > 0) {
        const itemsToInsert = newItems.map(item => ({
          shopping_cart_id: cartId,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price
        }));
        await trx('cart_item').insert(itemsToInsert);
        
        // Recalcular total estimado
        const total = itemsToInsert.reduce((acc, item) => acc + (Number(item.quantity) * Number(item.unit_price)), 0);
        await trx('shopping_cart').where({ id: cartId }).update({ total_estimated: total });
      } else {
        await trx('shopping_cart').where({ id: cartId }).update({ total_estimated: 0 });
      }

      return true;
    });
  },

  // Eliminar o Cancelar carrito
  deleteCart: async (id) => {
    return await db('shopping_cart').where({ id }).del();
  },

  // LA MAGIA: Convertir Carrito a Venta Real
  // Afecta: sales, sales_product, store_product (stock), cash_movement, shopping_cart
  finalizeCartToSale: async (cartId, userId, paymentMethod) => {
    return await db.transaction(async (trx) => {
      // 1. Obtener datos del carrito
      const cart = await trx('shopping_cart').where({ id: cartId }).first();
      if (!cart) throw new Error('Cart not found');
      if (cart.status === 'completed') throw new Error('Cart already finalized');

      const items = await trx('cart_item').where({ shopping_cart_id: cartId });
      if (items.length === 0) throw new Error('Cart is empty');

      // 2. Buscar sesión de caja ABIERTA para la tienda
      // Esto es vital para la consistencia financiera
      const cashSession = await trx('cash_session')
        .where({ store_id: cart.store_id, status: 'open' })
        .first();
      
      if (!cashSession) {
        throw new Error('No hay una caja abierta para esta tienda. Abra caja antes de cobrar.');
      }

      // 3. Calcular total real
      const totalSale = items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unit_price)), 0);

      // 4. Crear registro en SALES
      const [newSale] = await trx('sales').insert({
        user_id: userId, // El usuario (dueño) que confirma la venta en la App
        store_id: cart.store_id,
        total: totalSale,
        sale_date: new Date(), // Timestamp actual
        payment_method: paymentMethod || 'CASH',
        status: 'COMPLETED',
        notes: `Venta WhatsApp - Cliente: ${cart.customer_name || cart.customer_phone} (Ref #${cart.id})`
      }).returning('*');

      // 5. Mover items a SALES_PRODUCT y descontar STOCK
      for (const item of items) {
        // Insertar detalle de venta
        await trx('sales_product').insert({
          sales_id: newSale.id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price
        });

        // Descontar stock en store_product
        await trx('store_product')
          .where({ store_id: cart.store_id, product_id: item.product_id })
          .decrement('stock', item.quantity);
      }

      // 6. Registrar Movimiento de Caja (INGRESO)
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

      // 7. Marcar carrito como completado
      await trx('shopping_cart').where({ id: cartId }).update({ status: 'completed' });

      return newSale;
    });
  }
};

module.exports = ShoppingCartModel;