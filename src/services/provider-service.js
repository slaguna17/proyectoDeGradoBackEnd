const ProviderModel = require('../models/provider-model');

const ProviderService = {
    
  getAllProviders: async () => {
    return await ProviderModel.getAllProviders();
  },

  getProviderById: async (id) => {
    if (!id) {
      throw new Error('Provider ID is required');
    }
    const provider = await ProviderModel.getProviderById(id);
    if (!provider) {
      throw new Error('Provider not found');
    }
    return provider;
  },

  createProvider: async (data) => {
    return ProviderModel.createProvider(data);
  },

  updateProvider: async (id, data) => {
    return await ProviderModel.updateProvider(id, data);
  },

  deleteProvider: async (id) => {
    return await ProviderModel.deleteProvider(id);
  }

};

module.exports = ProviderService;