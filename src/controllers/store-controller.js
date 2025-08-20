const StoreService = require('../services/store-service');
const { attachImageUrl, attachImageUrlMany, replaceImageKey } = require('../utils/image-helpers');

const StoreController = {

  // GET /api/stores?signed=true
  getAllStores: async (req, res) => {
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

  // GET /api/stores/:id?signed=true
  getStoreById: async (req, res) => {
    try {
      const signed = String(req.query.signed).toLowerCase() === 'true';
      const store = await StoreService.getStoreById(req.params.id);
      if (!store) return res.status(404).send("Store not found");
      const out = await attachImageUrl(store, 'logo', { signed });
      res.status(200).json(out);
    } catch (error) {
      console.error(error.message);
      res.status(404).send("Store not found");
    }
  },

  // POST /api/stores
  // Acepta { ..., logo_key } o { ..., image_key } o { ..., logo }
  createStore: async (req, res) => {
    const { name, address, city, logo, image_key, logo_key, history, phone } = req.body;

    if (!name || !address || !city || !phone) {
      return res.status(400).json({ error: 'Required fields: name, address, city, phone' });
    }

    try {
      const newStore = await StoreService.createStore({
        name,
        address,
        city,
        logo: logo_key ?? image_key ?? logo ?? null, // guardamos SOLO la key
        history,
        phone
      });
      const out = await attachImageUrl(newStore, 'logo', { signed: false });
      res.status(201).json({ message: 'Store created successfully', store: out });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error creating store' });
    }
  },

  // PUT /api/stores/:id  (+ removeImage opcional)
  updateStore: async (req, res) => {
    const { id } = req.params;
    const { name, address, city, logo, image_key, logo_key, history, phone, removeImage = false } = req.body;

    if (!name || !address || !city || !phone) {
      return res.status(400).json({ error: 'Required fields: name, address, city, phone' });
    }

    try {
      const prev = await StoreService.getStoreById(id);
      if (!prev) return res.status(404).json({ error: 'Store not found' });

      let nextLogo = prev.logo ?? null;
      if (removeImage) {
        if (prev.logo) await replaceImageKey(prev.logo, null);
        nextLogo = null;
      } else if (logo != null || image_key != null || logo_key != null) {
        nextLogo = await replaceImageKey(prev.logo, logo_key ?? image_key ?? logo);
      }

      const updated = await StoreService.updateStore(id, {
        name,
        address,
        city,
        logo: nextLogo,
        history,
        phone
      });

      if (!updated) return res.status(404).json({ error: 'Store not found' });

      const fresh = await StoreService.getStoreById(id);
      const out = await attachImageUrl(fresh, 'logo', { signed: false });
      res.status(200).json({ message: 'Store updated successfully', store: out });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error updating store' });
    }
  },

  deleteStore: async (req, res) => {
    const { id } = req.params;
    try {
      const prev = await StoreService.getStoreById(id).catch(() => null);
      const result = await StoreService.deleteStore(id);

      if (result === 'in_use') {
        return res.status(400).json({ error: 'Cannot delete store: it has related records' });
      }
      if (!result) return res.status(404).json({ error: 'Store not found' });

      if (prev?.logo) {
        try { const { deleteObject } = require('../services/image-service'); await deleteObject(prev.logo); } catch {}
      }
      return res.status(200).json({ message: 'Store deleted successfully' });
    } catch (error) {
      console.error('🔥 Delete Error:', error);
      res.status(500).json({ error: 'Error deleting store' });
    }
  }
};

module.exports = StoreController;
