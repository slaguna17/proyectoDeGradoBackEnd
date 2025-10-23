const PurchaseService = require('../services/purchase-service');

const PurchaseController = {
    registerPurchase: async (req, res) => {
        try {
            const result = await PurchaseService.registerPurchase(req.body);
            res.status(201).json({ message: 'Purchase registered successfully', purchase: result });
        } catch (error) {
            console.error(error);
            const status = error.status || 500;
            res.status(status).json({ error: error.message || 'Error registering purchase' });
        }
    },

    getAllPurchases: async (req, res) => {
        try {
            const purchases = await PurchaseService.getAllPurchases();
            res.json(purchases);
        } catch (error) {
            res.status(500).json({ error: 'Error fetching purchases' });
        }
    },

    getPurchaseById: async (req, res) => {
        try {
            const purchase = await PurchaseService.getPurchaseById(req.params.id);
            res.json(purchase);
        } catch (error) {
            res.status(500).json({ error: 'Error fetching purchase' });
        }
    },

    getPurchasesByStore: async (req, res) => {
        try {
            const purchases = await PurchaseService.getPurchasesByStore(req.params.storeId);
            res.json(purchases);
        } catch (error) {
            res.status(500).json({ error: 'Error fetching purchases by store' });
        }
    },

    getPurchasesByUser: async (req, res) => {
        try {
            const purchases = await PurchaseService.getPurchasesByUser(req.params.userId);
            res.json(purchases);
        } catch (error) {
            res.status(500).json({ error: 'Error fetching purchases by user' });
        }
    },

    getPurchasesByProvider: async (req, res) => {
        try {
            const purchases = await PurchaseService.getPurchasesByProvider(req.params.providerId);
            res.json(purchases);
        } catch (error) {
            res.status(500).json({ error: 'Error fetching purchases by provider' });
        }
    },

    updatePurchase: async (req, res) => {
        try {
            const result = await PurchaseService.updatePurchase(req.params.id, req.body);
            res.json({ message: 'Purchase updated successfully', purchase: result });
        } catch (error) {
            res.status(500).json({ error: 'Error updating purchase' });
        }
    },

    deletePurchase: async (req, res) => {
        try {
            await PurchaseService.deletePurchase(req.params.id);
            res.json({ message: 'Purchase deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: 'Error deleting purchase' });
        }
    }
};

module.exports = PurchaseController