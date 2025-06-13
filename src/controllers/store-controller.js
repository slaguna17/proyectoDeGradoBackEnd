const StoreService = require('../services/store-service');

const StoreController = {

    getAllStores: async (req, res) => {
        try {
            const stores = await StoreService.getAllStores();
            res.status(200).json(stores);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error retrieving stores' });
        }
    },

    getStoreById: async (req, res) => {
      try {
        const store = await StoreService.getStoreById(req.params.id);
        res.status(200).json(store); 
      } catch (error) {
        console.error(error.message);
        res.status(404).send("Store not found")
      }
    },

    createStore: async (req, res) => {
        const { name, address, city, logo, history, phone } = req.body;

        if (!name || !address || !city || !phone) {
            return res.status(400).json({ error: 'Required fields: name, address, city, phone' });
        }

        try {
            const newStore = await StoreService.createStore({
            name,
            address,
            city,
            logo,
            history,
            phone
        });
            res.status(201).json({ message: 'Store created successfully', store: newStore });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error creating store' });
        }
    },

    updateStore: async (req, res) => {
        const { id } = req.params;
        const { name, address, city, logo, history, phone } = req.body;

        if (!name || !address || !city || !phone) {
            return res.status(400).json({ error: 'Required fields: name, address, city, phone' });
        }

        try {
            const updated = await StoreService.updateStore(id, {
                name,
                address,
                city,
                logo,
                history,
                phone
            });

            if (updated) {
                res.status(200).json({ message: 'Store updated successfully' });
            } else {
                res.status(404).json({ error: 'Store not found' });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error updating store' });
        }
    },

    deleteStore: async (req, res) => {
        const { id } = req.params;
        try {
            const result = await StoreService.deleteStore(id);

            if (result === 'in_use') {
                return res.status(400).json({ error: 'Cannot delete store: it has related records' });
            }

            if (result) {
                return res.status(200).json({ message: 'Store deleted successfully' });
            } else {
                return res.status(404).json({ error: 'Store not found' });
            }
        } catch (error) {
            console.error('🔥 Delete Error:', error);
            res.status(500).json({ error: 'Error deleting store' });
        }
    }

  };

module.exports = StoreController;