const ShoppingCartModel = require('../models/shopping-cart-model');

const ShoppingCartService = {
  createCart: async (data, items) => {
    if (!data.store_id || !data.customer_phone) {
      throw new Error('Missing store_id or customer_phone');
    }
    
    const cartData = {
      store_id: data.store_id,
      customer_phone: data.customer_phone,
      customer_name: data.customer_name,
      total_estimated: items.reduce((acc, i) => acc + (Number(i.quantity) * Number(i.unit_price)), 0),
      status: 'pending'
    };
    
    return await ShoppingCartModel.createCart(cartData, items);
  },

  getCartsByStore: async (storeId) => {
    if (!storeId) throw new Error('Store ID is required');
    return await ShoppingCartModel.getCartsByStore(storeId);
  },

  updateCart: async (cartId, items) => {
    if (!items || !Array.isArray(items)) throw new Error('Invalid items format');
    return await ShoppingCartModel.updateCartItems(cartId, items);
  },

  deleteCart: async (cartId) => {
    return await ShoppingCartModel.deleteCart(cartId);
  },

  finalizeCart: async (cartId, userId, paymentMethod) => {
    if (!userId) throw new Error('User ID is required to finalize sale');
    return await ShoppingCartModel.finalizeCartToSale(cartId, userId, paymentMethod);
  }
};

module.exports = ShoppingCartService;