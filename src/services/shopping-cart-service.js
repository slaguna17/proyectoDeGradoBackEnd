const ShoppingCartModel = require('../models/shopping-cart-model');

const createError = (message, status = 400, code, details) => {
  const error = new Error(message);
  error.status = status;
  if (code) error.code = code;
  if (details) error.details = details;
  return error;
};

const hasValue = (value) => value !== undefined && value !== null && value !== '';

const validateItems = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw createError('Cart items must be a non-empty array.', 400, 'INVALID_CART_ITEMS');
  }

  return items.map((item) => {
    const productId = hasValue(item?.product_id) ? Number(item.product_id) : NaN;
    const quantity = hasValue(item?.quantity) ? Number(item.quantity) : NaN;
    const unitPrice = hasValue(item?.unit_price) ? Number(item.unit_price) : NaN;

    if (
      !Number.isSafeInteger(productId) ||
      productId <= 0 ||
      !Number.isSafeInteger(quantity) ||
      quantity <= 0 ||
      !Number.isFinite(unitPrice) ||
      unitPrice < 0
    ) {
      throw createError('Invalid cart item data.', 400, 'INVALID_CART_ITEM');
    }

    return {
      product_id: productId,
      quantity,
      unit_price: unitPrice
    };
  });
};

const ShoppingCartService = {
  createCart: async (data, items) => {
    if (!data.store_id || !data.customer_phone) {
      throw createError('Missing store_id or customer_phone', 400, 'MISSING_CART_DATA');
    }

    const normalizedItems = validateItems(items);
    
    const cartData = {
      store_id: data.store_id,
      customer_phone: data.customer_phone,
      customer_name: data.customer_name,
      total_estimated: normalizedItems.reduce((acc, i) => acc + (Number(i.quantity) * Number(i.unit_price)), 0),
      status: 'pending'
    };
    
    return await ShoppingCartModel.createCart(cartData, normalizedItems);
  },

  getCartsByStore: async (storeId) => {
    if (!storeId) throw createError('Store ID is required', 400, 'STORE_ID_REQUIRED');
    return await ShoppingCartModel.getCartsByStore(storeId);
  },

  updateCart: async (cartId, items) => {
    return await ShoppingCartModel.updateCartItems(cartId, validateItems(items));
  },

  deleteCart: async (cartId) => {
    return await ShoppingCartModel.deleteCart(cartId);
  },

  finalizeCart: async (cartId, userIdOrData, paymentMethod) => {
    const data = typeof userIdOrData === 'object' && userIdOrData !== null
      ? userIdOrData
      : { userId: userIdOrData, paymentMethod };
    const userId = data.userId ?? data.user_id;
    const normalizedPaymentMethod = data.paymentMethod ?? data.payment_method;

    if (!userId) throw createError('User ID is required to finalize sale', 400, 'USER_ID_REQUIRED');
    return await ShoppingCartModel.finalizeCartToSale(cartId, userId, normalizedPaymentMethod);
  }
};

module.exports = ShoppingCartService;
