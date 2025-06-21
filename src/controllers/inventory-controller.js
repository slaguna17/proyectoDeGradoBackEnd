const InventoryService = require('../services/inventory-service');

const InventoryController = {

  getStock: async (req, res) => {
    const { storeId, productId } = req.params;
    try {
        const stock = await InventoryService.getStock(storeId, productId);
        if (stock == null) {
          return res.status(400).json({ error: 'Product not found in this store' });
        }
        
        res.status(200).json({
          store_id: parseInt(storeId),
          product_id: parseInt(productId),
          stock
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching stock for this product in this store' });
    }
  },

  updateStock: async (req, res) => {
    const { storeId, productId } = req.params;
    const { stock } = req.body;

    if (stock == null || isNaN(stock)) {
      return res.status(400).json({ error: 'Invalid stock value' });
    }

    try {
      const result = await InventoryService.updateStock(storeId, productId, stock);
      res.json({ message: 'Stock updated successfully', stock: result });
    } catch (err) {
      res.status(500).json({ error: 'Error updating stock' });
    }
  }
};

module.exports = InventoryController;