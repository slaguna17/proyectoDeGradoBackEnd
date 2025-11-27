const ShoppingCartService = require('../services/shopping-cart-service');
const { attachImageUrl } = require('../utils/image-helpers');

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
      res.status(500).json({ error: error.message || 'Error creating whatsapp cart' });
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
      res.status(500).json({ error: 'Error fetching carts' });
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
      res.status(500).json({ error: 'Error updating cart' });
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
      res.status(500).json({ error: 'Error deleting cart' });
    }
  },

  // Endpoint for Android
  finalizeCart: async (req, res) => {
    try {
      const { id } = req.params; // Cart ID
      const { userId, paymentMethod } = req.body; 

      const sale = await ShoppingCartService.finalizeCart(id, userId, paymentMethod);
      res.status(200).json({ message: 'Sale finalized successfully', saleId: sale.id });
    } catch (error) {
      console.error("Finalize Error:", error.message);
      res.status(409).json({ error: error.message });
    }
  }
};

module.exports = ShoppingCartController;