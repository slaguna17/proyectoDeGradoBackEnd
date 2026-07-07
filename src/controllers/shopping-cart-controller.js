const ShoppingCartService = require('../services/shopping-cart-service');
const { attachImageUrl } = require('../utils/image-helpers');

const handleShoppingCartError = (res, error, fallbackMessage, fallbackCode) => {
  const status = error.status || 500;
  return res.status(status).json({
    error: status === 500 ? fallbackMessage : error.message,
    code: error.code || fallbackCode,
    details: error.details || null
  });
};

const ShoppingCartController = {

  // Endpoint for AI agent
  createCart: async (req, res) => {
    try {
      const { store_id, customer_phone, customer_name, items } = req.body;
      const newCart = await ShoppingCartService.createCart(
        { store_id, customer_phone, customer_name },
        items
      );
      res.status(201).json(newCart);
    } catch (error) {
      console.error(error);
      return handleShoppingCartError(res, error, 'Error creating whatsapp cart', 'CREATE_CART_ERROR');
    }
  },

  // Endpoint for Android
  getCartsByStore: async (req, res) => {
    try {
      const { storeId } = req.params;
      const carts = await ShoppingCartService.getCartsByStore(storeId);
      for (const cart of carts) {
        if (cart.items) {
            for (let i = 0; i < cart.items.length; i++) {
                if (cart.items[i].product_image) {
                    const temp = { image: cart.items[i].product_image };
                    // Sign url of S3
                    await attachImageUrl(temp, 'image', { signed: true });
                    cart.items[i].imageUrl = temp.image;
                }
            }
        }
      }

      res.status(200).json(carts);
    } catch (error) {
      console.error(error);
      return handleShoppingCartError(res, error, 'Error fetching carts', 'GET_CARTS_ERROR');
    }
  },

  // Endpoint for Android
  updateCart: async (req, res) => {
    try {
      const { id } = req.params;
      const { items } = req.body;
      await ShoppingCartService.updateCart(id, items);
      res.status(200).json({ message: 'Cart updated successfully' });
    } catch (error) {
      console.error(error);
      return handleShoppingCartError(res, error, 'Error updating cart', 'UPDATE_CART_ERROR');
    }
  },

  // Endpoint for Android
  deleteCart: async (req, res) => {
    try {
      const { id } = req.params;
      await ShoppingCartService.deleteCart(id);
      res.status(200).json({ message: 'Cart deleted' });
    } catch (error) {
      console.error(error);
      return handleShoppingCartError(res, error, 'Error deleting cart', 'DELETE_CART_ERROR');
    }
  },

  // Endpoint for Android
  finalizeCart: async (req, res) => {
    try {
      const { id } = req.params; // Cart ID
      const { userId, user_id, paymentMethod, payment_method } = req.body;

      const sale = await ShoppingCartService.finalizeCart(id, {
        userId,
        user_id,
        paymentMethod,
        payment_method
      });
      res.status(200).json({ message: 'Sale finalized successfully', saleId: sale.id });
    } catch (error) {
      console.error("Finalize Error:", error.message);
      return handleShoppingCartError(res, error, 'Error finalizing cart', 'FINALIZE_CART_ERROR');
    }
  }
};

module.exports = ShoppingCartController;
