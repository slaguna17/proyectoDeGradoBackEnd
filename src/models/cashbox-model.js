const db = require('../config/db');
const dayjs = require('dayjs');

const CashboxModel = {
  openCashbox: async (store_id, opening_amount) => {
    const today = dayjs().format('YYYY-MM-DD');

    const existing = await db('total_cash')
      .where('store_id', store_id)
      .andWhereRaw("DATE(opened_at) = ?", [today])
      .andWhere('status', 'open')
      .first();

    if (existing) return 'already_open';

    const [cashbox] = await db('total_cash')
      .insert({
        store_id,
        opening_amount,
        status: 'open',
        opened_at: db.fn.now(),
        created_at: db.fn.now(),
        updated_at: db.fn.now()
      })
      .returning('*');

    return cashbox;
  }
};

module.exports = CashboxModel
