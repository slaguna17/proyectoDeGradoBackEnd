const SalesModel = require('../models/sales-model');

const SalesService = {
    createSale: async (data) => {
        const { store_id, user_id, shift_id, products, payment_method } = data;

        if (!store_id || !user_id || !shift_id || !products?.length) {
            throw new Error('Missing required fields');
        }

        return await SalesModel.createSaleTransaction(data);
    }

};

module.exports = SalesService