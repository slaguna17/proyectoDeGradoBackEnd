const InventoryService = require('../services/inventory-service');

const InventoryController = {
  getStock: async (req, res) => {
    const { storeId, productId } = req.params;

    try {
      const inventory = await InventoryService.getStock(storeId, productId);

      if (inventory == null) {
        return res.status(400).json({ error: 'Product not found in this store' });
      }

      res.status(200).json({
        store_id: parseInt(storeId, 10),
        product_id: parseInt(productId, 10),
        stock: inventory.stock,
        expiration_date: inventory.expiration_date ?? null
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error fetching stock for this product in this store' });
    }
  },

  updateStock: async (req, res) => {
    const { storeId, productId } = req.params;
    const { stock } = req.body;

    const hasExpirationDate =
      Object.prototype.hasOwnProperty.call(req.body, 'expiration_date') ||
      Object.prototype.hasOwnProperty.call(req.body, 'expirationDate');

    const expiration_date = req.body.expiration_date ?? req.body.expirationDate ?? null;

    if (stock == null || isNaN(Number(stock))) {
      return res.status(400).json({ error: 'Invalid stock value' });
    }

    try {
      const result = await InventoryService.updateStock(storeId, productId, {
        stock: Number(stock),
        expiration_date,
        hasExpirationDate
      });

      res.status(200).json({
        message: 'Inventory updated successfully',
        store_id: parseInt(storeId, 10),
        product_id: parseInt(productId, 10),
        stock: result.stock,
        expiration_date: result.expiration_date ?? null
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error updating stock' });
    }
  }
};

module.exports = InventoryController;