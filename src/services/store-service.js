const StoreModel = require('../models/store-model');

const StoreService = {
    getStores: async () => {
        const stores = await StoreModel.getStores();
        return stores;
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

    createStore: async (storeData) => {
        return StoreModel.createStore(storeData)
    },

    updateStore: async (id, updateBody) => {
        const store = await StoreModel.updateStore(id, updateBody)
        if(!store){
            throw new Error("Store not found")
        }
        return store; 
    },

    deleteStore: async (id) => {
        if (!id) {
            throw new Error('Store ID is required');
        }
        const store = await StoreModel.deleteStore(id);
        if (!store) {
            throw new Error('Store not found');
        }
        return { message: "Store deleted successfully" };
    }

  };

module.exports = StoreService;