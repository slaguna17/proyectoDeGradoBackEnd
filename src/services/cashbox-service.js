const CashboxModel = require('../models/cashbox-model');

const CashboxService = {
  openCashbox: async (store_id, opening_amount) => {
    return await CashboxModel.openCashbox(store_id, opening_amount);
  }
};

module.exports = CashboxService