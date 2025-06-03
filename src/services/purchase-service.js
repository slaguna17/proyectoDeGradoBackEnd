const PurchaseModel = require('../models/purchase-model');

const PurchaseService = {
  registerPurchase: async (data) => {
    return await PurchaseModel.registerPurchase(data);
  }
};

module.exports = PurchaseService