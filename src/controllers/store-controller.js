const StoreService = require('../services/store-service');
const { attachImageUrl, attachImageUrlMany } = require('../utils/image-helpers');
const { deleteObject } = require('../services/image-service');

const StoreController = {

  async getAllStores(req, res) {
    try {
      const signed = String(req.query.signed).toLowerCase() === 'true';
      const stores = await StoreService.getAllStores();
      const out = await attachImageUrlMany(stores, 'logo', { signed });
      res.status(200).json(out);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error retrieving stores' });
    }
  },

  async getStoreById(req, res) {
    try {
      const signed = String(req.query.signed).toLowerCase() === 'true';
      const store = await StoreService.getStoreById(req.params.id);
      if (!store) return res.status(404).send('Store not found');
      const out = await attachImageUrl(store, 'logo', { signed });
      res.status(200).json(out);
    } catch (error) {
      console.error(error);
      res.status(404).send('Store not found');
    }
  },

  async createStore(req, res, next) {
    try {
      const { name, address, city, history, phone, logo } = req.body || {};

      const payload = {
        name,
        address,
        city,
        history,
        phone,
        logo: logo || null,
      };

      const created = await StoreService.createStore(payload);

      // Return constructed object with logo URL resolved 
      const out = await attachImageUrl(created, 'logo');
      return res.status(201).json(out);

    } catch (err) {
      next(err);
    }
  },

  async updateStore(req, res, next) {
    try {
      const id = Number(req.params.id);
      const { name, address, city, history, phone, logo } = req.body || {};
      const previousStore = await StoreService.getStoreById(id);

      if (!previousStore) {
        return res.status(404).json({ error: 'Store not found' });
      }

      const payload = { name, address, city, history, phone, logo };
      const oldLogoKey = previousStore.logo;
      const newLogoKey = payload.logo;

      if (oldLogoKey && oldLogoKey !== newLogoKey) {
        deleteObject(oldLogoKey).catch(console.error);
      }
      
      const updatedCount = await StoreService.updateStore(id, payload);
      if (!updatedCount) {
        return res.status(404).json({ error: 'Store not found or no changes made' });
      }

      return res.json({ message: 'Store updated', id });

    } catch (err) {
      next(err);
    }
  },

  async deleteStore(req, res) {
    const { id } = req.params;
    try {
      const storeToDelete = await StoreService.getStoreById(id);
      if (!storeToDelete) {
        return res.status(404).json({ error: 'Store not found' });
      }

      const result = await StoreService.deleteStore(id);

      if (result === 'in_use') {
        return res.status(400).json({ error: 'Cannot delete store: it has related records' });
      }

      if (storeToDelete.logo) {
        await deleteObject(storeToDelete.logo).catch(console.error);
      }

      return res.status(200).json({ message: 'Store deleted successfully' });

    } catch (error) {
      next(error);
    }
  },
};

module.exports = StoreController;
