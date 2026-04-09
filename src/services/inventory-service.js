const InventoryModel = require('../models/inventory-model');

const InventoryService = {
  getStock: async (storeId, productId) => {
    return await InventoryModel.getStock(storeId, productId);
  },

  updateStock: async (storeId, productId, data) => {
    return await InventoryModel.updateStock(storeId, productId, data);
  }
};

module.exports = InventoryService;