const InventoryService = require('../services/inventory-service');

const InventoryController = {
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