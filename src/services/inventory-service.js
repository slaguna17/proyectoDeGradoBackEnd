const InventoryModel = require('../models/inventory-model');

const InventoryService = {
  updateStock: async (storeId, productId, stock) => {
    return await InventoryModel.updateStock(storeId, productId, stock);
  }
};

module.exports = InventoryService;