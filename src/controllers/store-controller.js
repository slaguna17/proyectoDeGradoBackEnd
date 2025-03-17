const StoreService = require('../services/store-service');

const StoreController = {
    getStores: async (req,res) => {
        try {
            const stores = await StoreService.getStores()
            res.status(200).json(stores);
        } catch (error) {
            console.error(error.message);
            res.status(500).send("Server error, couldn't get Stores")
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

    createStore: async(req,res) => {
        try {
            const newStore = await StoreService.createStore(req.body);
            res.status(200).json(newStore)
        } catch (error) {
            console.error(error.message);
            res.status(500).send("Server error, couldn't create Store")
        }
    },

    updateStore: async(req,res) => {
        try {
            const updatedStore = await StoreService.updateStore(req.params.id, req.body)
            res.status(200).json(updatedStore)
        } catch (error) {
            console.error(error.message);
            res.status(404).send("Couldn't update, Store not found")
        }
    },

    deleteStore: async(req, res) => {
        try {
            await StoreService.deleteStore(req.params.id)
            res.status(200).json({message: "Store deleted successfully"})
        } catch (error) {
            console.error(error.message);
            res.status(404).send({ error: "Couldn't delete, Store not found" })
        }
    }
  };

module.exports = StoreController;