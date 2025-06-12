const db = require('../config/db');
const dayjs = require('dayjs');

const CashboxModel = {
  openCashbox: async (store_id, opening_amount) => {
    const today = dayjs().format('YYYY-MM-DD');

    const existing = await db('cash_summary')
      .where('store_id', store_id)
      .andWhereRaw("DATE(opened_at) = ?", [today])
      .andWhere('status', 'open')
      .first();

    if (existing) return 'already_open';

    const [cashbox] = await db('cash_summary')
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
  },

  closeCashbox: async ({ store_id, user_id, date }) => {
    return await db.transaction(async trx => {
      const summary = await trx('cash_summary')
        .where({ store_id })
        .andWhereRaw(`DATE(opened_at) = ?`, [date])
        .andWhere({ status: 'open' })
        .first();

      if (!summary) {
        throw new Error("No open cash box found for the given store and date");
      }

      const sales = await trx('sales')
        .where({ store_id })
        .andWhereRaw(`DATE(created_at) = ?`, [date]);

      const totalSales = sales.reduce((sum, s) => sum + Number(s.total || 0), 0);

      const purchases = await trx('purchase')
        .where({ store_id })
        .andWhereRaw(`DATE(created_at) = ?`, [date]);

      const totalPurchases = purchases.reduce((sum, p) => sum + Number(p.total || 0), 0);

      const closingAmount = Number(summary.opening_amount || 0) + totalSales - totalPurchases;

      const [updated] = await trx('cash_summary')
        .where({ id: summary.id })
        .update({
          closing_amount: closingAmount,
          closed_at: trx.fn.now(),
          status: 'closed'
        })
        .returning('*');

      return updated;
    });
  }
};

module.exports = CashboxModel
