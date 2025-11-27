const StoreModel = require('../models/store-model');

const StoreService = {
  getAllStores: async () => {
    return await StoreModel.getAllStores();
  },

  getStoreById: async (id) => {
    if (!id) return null;
    return await StoreModel.getStoreById(id);
  },

  createStore: async (data) => {
    return StoreModel.createStore(data);
  },

  updateStore: async (id, data) => {
    if (!id) return 0;
    return await StoreModel.updateStore(id, data);
  },

  deleteStore: async (id) => {
    if (!id) return 0;
    return await StoreModel.deleteStore(id);
  }
};

module.exports = StoreService;
