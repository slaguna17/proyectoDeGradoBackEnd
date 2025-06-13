const PurchaseModel = require('../models/purchase-model');

const PurchaseService = {
    registerPurchase: async (data) => {
        return await PurchaseModel.registerPurchase(data)
    },

    getAllPurchases: async () => {
        return await PurchaseModel.getAllPurchases()
    },
    
    getPurchaseById: async (id) => {
        return await PurchaseModel.getPurchaseById(id)
    },
    
    getPurchasesByStore: async (storeId) => {
        return await PurchaseModel.getPurchasesByStore(storeId)
    },

    getPurchasesByUser: async (userId) => {
        return await PurchaseModel.getPurchasesByUser(userId)
    },
    
    getPurchasesByProvider: async (providerId) => {
        return await PurchaseModel.getPurchasesByProvider(providerId)
    },

    updatePurchase: async (id, data) => {
        return await PurchaseModel.updatePurchase(id, data)
    },

    deletePurchase: async (id) => {
        return await PurchaseModel.deletePurchase(id)
    }
};

module.exports = PurchaseService