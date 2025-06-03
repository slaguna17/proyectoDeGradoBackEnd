const StoreModel = require('../models/store-model');

const StoreService = {
  getAllStores: async () => {
    return await StoreModel.getAllStores();
  },

  getStoreById: async (id) => {
    if (!id) {
      throw new Error('Store ID is required');
    }
    const store = await StoreModel.getStoreById(id);
    if (!store) {
      throw new Error('Store not found');
    }
    return store;
  },

  createStore: async (data) => {
    return StoreModel.createStore(data)
  },

  updateStore: async (id, data) => {
    return await StoreModel.updateStore(id, data);
  },

  deleteStore: async (id) => {
    return await StoreModel.deleteStore(id);
  }

};

module.exports = StoreService;