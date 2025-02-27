const ProviderModel = require('../models/provider-model');

const ProviderService = {
    getProviders: async () => {
        const providers = await ProviderModel.getProviders();
        return providers;
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

    createProvider: async (providerData) => {
      return ProviderModel.createProvider(providerData);
    },

    updateProvider: async (id, updateBody) => {
        const provider = await ProviderModel.updateProvider(id, updateBody)
        if(!provider){
            throw new Error("Provider not found")
        }
        return provider; 
    },

    deleteProvider: async (id) => {
        if (!id) {
            throw new Error('Provider ID is required');
        }
        const deletedCount = await ProviderModel.deleteProvider(id);
        if (deletedCount === 0) {
            throw new Error('Provider not found');
        }
        return { message: "Provider deleted successfully" };
    }

  };

module.exports = ProviderService;