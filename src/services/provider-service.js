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
    return await ProviderModel.createProvider(data);
  },

  updateProvider: async (id, data) => {
    return await ProviderModel.updateProvider(id, data);
  },

  getProductsByProviderId: async (providerId) => {
    if (!providerId) {
      throw new Error('Provider ID is required');
    }

    const exists = await ProviderModel.providerExists(providerId);

    if (!exists) {
      throw new Error('Provider not found');
    }

    return await ProviderModel.getProductsByProviderId(providerId);
  },

  assignProduct: async (providerId, productId) => {
    if (!providerId || !productId) {
      throw new Error('Provider ID and product ID are required');
    }

    const providerExists = await ProviderModel.providerExists(providerId);
    if (!providerExists) {
      throw new Error('Provider not found');
    }

    const productExists = await ProviderModel.productExists(productId);
    if (!productExists) {
      throw new Error('Product not found');
    }

    return await ProviderModel.assignProduct(providerId, productId);
  },

  syncProducts: async (providerId, productIds = []) => {
    if (!providerId) {
      throw new Error('Provider ID is required');
    }

    if (!Array.isArray(productIds)) {
      throw new Error('productIds must be an array');
    }

    const providerExists = await ProviderModel.providerExists(providerId);
    if (!providerExists) {
      throw new Error('Provider not found');
    }

    const uniqueIds = [...new Set(productIds.map(Number).filter(Number.isInteger))];

    if (uniqueIds.length > 0) {
      const existingCount = await ProviderModel.countExistingProducts(uniqueIds);

      if (existingCount !== uniqueIds.length) {
        throw new Error('One or more products do not exist');
      }
    }

    return await ProviderModel.syncProducts(providerId, uniqueIds);
  },

  removeProduct: async (providerId, productId) => {
    if (!providerId || !productId) {
      throw new Error('Provider ID and product ID are required');
    }

    const providerExists = await ProviderModel.providerExists(providerId);
    if (!providerExists) {
      throw new Error('Provider not found');
    }

    return await ProviderModel.removeProduct(providerId, productId);
  },

  deleteProvider: async (id) => {
    return await ProviderModel.deleteProvider(id);
  }
};

module.exports = ProviderService;