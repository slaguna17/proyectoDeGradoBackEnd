const SalesModel = require('../models/sales-model');

const SalesService = {
    registerSale: async (data) => {
       return await SalesModel.registerSale(data)
    },

    getAllSales: async () => {
        return await SalesModel.getAllSales()
    },
    
    getSaleById: async (id) => {
        return await SalesModel.getSaleById(id)
    },
    
    getSalesByStore: async (storeId) => {
        return await SalesModel.getSalesByStore(storeId)
    },
    
    getSalesByUser: async (userId) => {
        return await SalesModel.getSalesByUser(userId)
    },
    
    updateSale: async (id, data) => {
        return await SalesModel.updateSale(id, data)
    },
    
    deleteSale: async (id) => {
        return await SalesModel.deleteSale(id)
    },

};

module.exports = SalesService