const CashboxModel = require('../models/cashbox-model');

const CashboxService = {
  openCashbox: async (store_id, opening_amount) => {
    return await CashboxModel.openCashbox(store_id, opening_amount);
  },

  closeCashbox: async ({ store_id, user_id, date }) => {
    if (!store_id || !user_id || !date) {
      throw new Error("store_id, user_id and date are required");
    }

    return await CashboxModel.closeCashbox({ store_id, user_id, date });
  }
};

module.exports = CashboxService