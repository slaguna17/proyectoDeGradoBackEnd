const ProviderService = require('../services/provider-service');

const ProviderController = {
  getAllProviders: async (req, res) => {
    try {
      const providers = await ProviderService.getAllProviders();
      res.status(200).json(providers);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error retrieving providers' });
    }
  },

  getProviderById: async (req, res) => {
    try {
      const provider = await ProviderService.getProviderById(req.params.id);
      res.status(200).json(provider);
    } catch (error) {
      console.error(error.message);
      res.status(404).json({ error: 'Provider not found' });
    }
  },

  createProvider: async (req, res) => {
    const {
      name,
      address,
      phone,
      email,
      contact_person_name,
      notes
    } = req.body;

    if (!name || !address || !phone) {
      return res.status(400).json({ error: 'Required fields: name, address, phone' });
    }

    try {
      const newProvider = await ProviderService.createProvider({
        name,
        address,
        phone,
        email,
        contact_person_name,
        notes
      });

      res.status(201).json({
        message: 'Provider created successfully',
        provider: newProvider
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error creating provider' });
    }
  },

  updateProvider: async (req, res) => {
    const { id } = req.params;
    const {
      name,
      address,
      phone,
      email,
      contact_person_name,
      notes
    } = req.body;

    if (!name || !address || !phone) {
      return res.status(400).json({ error: 'Required fields: name, address, phone' });
    }

    try {
      const updated = await ProviderService.updateProvider(id, {
        name,
        address,
        phone,
        email,
        contact_person_name,
        notes
      });

      if (updated) {
        res.status(200).json({ message: 'Provider updated successfully' });
      } else {
        res.status(404).json({ error: 'Provider not found' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error updating provider' });
    }
  },

  getProductsByProvider: async (req, res) => {
    try {
      const products = await ProviderService.getProductsByProviderId(req.params.id);
      res.status(200).json(products);
    } catch (error) {
      console.error(error.message);

      if (error.message === 'Provider not found') {
        return res.status(404).json({ error: error.message });
      }

      return res.status(400).json({ error: error.message });
    }
  },

  assignProduct: async (req, res) => {
    try {
      const { id, productId } = req.params;
      const products = await ProviderService.assignProduct(id, productId);

      res.status(200).json({
        message: 'Product assigned to provider successfully',
        products
      });
    } catch (error) {
      console.error(error.message);

      if (error.message === 'Provider not found' || error.message === 'Product not found') {
        return res.status(404).json({ error: error.message });
      }

      return res.status(400).json({ error: error.message });
    }
  },

  syncProducts: async (req, res) => {
    try {
      const { id } = req.params;
      const { productIds } = req.body;

      const products = await ProviderService.syncProducts(id, productIds);

      res.status(200).json({
        message: 'Provider products synchronized successfully',
        products
      });
    } catch (error) {
      console.error(error.message);

      if (error.message === 'Provider not found') {
        return res.status(404).json({ error: error.message });
      }

      return res.status(400).json({ error: error.message });
    }
  },

  removeProduct: async (req, res) => {
    try {
      const { id, productId } = req.params;
      const products = await ProviderService.removeProduct(id, productId);

      res.status(200).json({
        message: 'Product removed from provider successfully',
        products
      });
    } catch (error) {
      console.error(error.message);

      if (error.message === 'Provider not found') {
        return res.status(404).json({ error: error.message });
      }

      return res.status(400).json({ error: error.message });
    }
  },

  deleteProvider: async (req, res) => {
    const { id } = req.params;

    try {
      const result = await ProviderService.deleteProvider(id);

      if (result === 'in_use') {
        return res.status(400).json({
          error: 'Cannot delete provider: it is linked to products or purchases'
        });
      }

      if (result) {
        return res.status(200).json({ message: 'Provider deleted successfully' });
      } else {
        return res.status(404).json({ error: 'Provider not found' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error deleting provider' });
    }
  }
};

module.exports = ProviderController;