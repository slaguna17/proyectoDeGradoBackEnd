const db = require('../config/db');

const toNumber = (value) => {
  if (value === undefined || value === null || value === '') return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const normalizeFilters = (filters = {}) => ({
  store_id: toNumber(filters.store_id),
  user_id: toNumber(filters.user_id),
  provider_id: toNumber(filters.provider_id),
  from: filters.from || null,
  to: filters.to || null,
  payment_method: filters.payment_method || null,
  status: filters.status || null
});

const applyDateRange = (query, dateColumn, from, to) => {
  if (from) {
    query.whereRaw(`DATE(${dateColumn}) >= ?`, [from]);
  }
  if (to) {
    query.whereRaw(`DATE(${dateColumn}) <= ?`, [to]);
  }
};

const applyTransactionFilters = (query, alias, dateColumn, filters, includeProvider = false) => {
  if (filters.store_id != null) {
    query.where(`${alias}.store_id`, filters.store_id);
  }

  if (filters.user_id != null) {
    query.where(`${alias}.user_id`, filters.user_id);
  }

  if (filters.payment_method) {
    query.where(`${alias}.payment_method`, filters.payment_method);
  }

  if (filters.status) {
    query.where(`${alias}.status`, filters.status);
  }

  if (includeProvider && filters.provider_id != null) {
    query.where(`${alias}.provider_id`, filters.provider_id);
  }

  applyDateRange(query, dateColumn, filters.from, filters.to);
};

const ReportsModel = {
  getSalesSummary: async (rawFilters) => {
    const filters = normalizeFilters(rawFilters);

    const baseSummaryQuery = db('sales as s');
    applyTransactionFilters(baseSummaryQuery, 's', 's.sale_date', filters);

    const summary = await baseSummaryQuery
      .clone()
      .countDistinct({ sales_count: 's.id' })
      .sum({ total_amount: 's.total' })
      .avg({ average_ticket: 's.total' })
      .first();

    const quantityRow = await db('sales as s')
      .join('sales_product as sp', 's.id', 'sp.sales_id')
      .modify((query) => applyTransactionFilters(query, 's', 's.sale_date', filters))
      .sum({ total_quantity: 'sp.quantity' })
      .first();

    const byDay = await db('sales as s')
      .modify((query) => applyTransactionFilters(query, 's', 's.sale_date', filters))
      .select(db.raw('DATE(s.sale_date) as date'))
      .countDistinct({ sales_count: 's.id' })
      .sum({ total_amount: 's.total' })
      .groupByRaw('DATE(s.sale_date)')
      .orderBy('date', 'asc');

    const byPaymentMethod = await db('sales as s')
      .modify((query) => applyTransactionFilters(query, 's', 's.sale_date', filters))
      .select('s.payment_method')
      .countDistinct({ sales_count: 's.id' })
      .sum({ total_amount: 's.total' })
      .groupBy('s.payment_method')
      .orderBy('s.payment_method', 'asc');

    const byStatus = await db('sales as s')
      .modify((query) => applyTransactionFilters(query, 's', 's.sale_date', filters))
      .select('s.status')
      .countDistinct({ sales_count: 's.id' })
      .sum({ total_amount: 's.total' })
      .groupBy('s.status')
      .orderBy('s.status', 'asc');

    return {
      filters,
      summary: {
        sales_count: Number(summary?.sales_count || 0),
        total_amount: summary?.total_amount || 0,
        average_ticket: summary?.average_ticket || 0,
        total_quantity: quantityRow?.total_quantity || 0
      },
      by_day: byDay,
      by_payment_method: byPaymentMethod,
      by_status: byStatus
    };
  },

  getSalesDetails: async (rawFilters) => {
    const filters = normalizeFilters(rawFilters);

    const rows = await db('sales as s')
      .leftJoin('store as st', 's.store_id', 'st.id')
      .leftJoin('user as u', 's.user_id', 'u.id')
      .modify((query) => applyTransactionFilters(query, 's', 's.sale_date', filters))
      .select(
        's.id',
        's.store_id',
        'st.name as store_name',
        's.user_id',
        'u.full_name as user_name',
        's.total',
        's.sale_date',
        's.payment_method',
        's.status',
        's.notes',
        's.created_at',
        's.updated_at'
      )
      .orderBy('s.sale_date', 'desc');

    return {
      filters,
      details: rows
    };
  },

  getSalesTopProducts: async (rawFilters) => {
    const filters = normalizeFilters(rawFilters);

    const rows = await db('sales as s')
      .join('sales_product as sp', 's.id', 'sp.sales_id')
      .join('product as p', 'sp.product_id', 'p.id')
      .modify((query) => applyTransactionFilters(query, 's', 's.sale_date', filters))
      .select(
        'p.id as product_id',
        'p.SKU',
        'p.name as product_name',
        'p.brand'
      )
      .sum({ total_quantity: 'sp.quantity' })
      .sum({ total_amount: db.raw('sp.quantity * sp.unit_price') })
      .countDistinct({ sales_count: 's.id' })
      .groupBy('p.id', 'p.SKU', 'p.name', 'p.brand')
      .orderBy('total_quantity', 'desc');

    return {
      filters,
      products: rows
    };
  },

  getPurchasesSummary: async (rawFilters) => {
    const filters = normalizeFilters(rawFilters);

    const baseSummaryQuery = db('purchase as p');
    applyTransactionFilters(baseSummaryQuery, 'p', 'p.purchase_date', filters, true);

    const summary = await baseSummaryQuery
      .clone()
      .countDistinct({ purchases_count: 'p.id' })
      .sum({ total_amount: 'p.total' })
      .avg({ average_purchase: 'p.total' })
      .first();

    const quantityRow = await db('purchase as p')
      .join('purchase_product as pp', 'p.id', 'pp.purchase_id')
      .modify((query) => applyTransactionFilters(query, 'p', 'p.purchase_date', filters, true))
      .sum({ total_quantity: 'pp.quantity' })
      .first();

    const byDay = await db('purchase as p')
      .modify((query) => applyTransactionFilters(query, 'p', 'p.purchase_date', filters, true))
      .select(db.raw('DATE(p.purchase_date) as date'))
      .countDistinct({ purchases_count: 'p.id' })
      .sum({ total_amount: 'p.total' })
      .groupByRaw('DATE(p.purchase_date)')
      .orderBy('date', 'asc');

    const byPaymentMethod = await db('purchase as p')
      .modify((query) => applyTransactionFilters(query, 'p', 'p.purchase_date', filters, true))
      .select('p.payment_method')
      .countDistinct({ purchases_count: 'p.id' })
      .sum({ total_amount: 'p.total' })
      .groupBy('p.payment_method')
      .orderBy('p.payment_method', 'asc');

    const byStatus = await db('purchase as p')
      .modify((query) => applyTransactionFilters(query, 'p', 'p.purchase_date', filters, true))
      .select('p.status')
      .countDistinct({ purchases_count: 'p.id' })
      .sum({ total_amount: 'p.total' })
      .groupBy('p.status')
      .orderBy('p.status', 'asc');

    return {
      filters,
      summary: {
        purchases_count: Number(summary?.purchases_count || 0),
        total_amount: summary?.total_amount || 0,
        average_purchase: summary?.average_purchase || 0,
        total_quantity: quantityRow?.total_quantity || 0
      },
      by_day: byDay,
      by_payment_method: byPaymentMethod,
      by_status: byStatus
    };
  },

  getPurchasesDetails: async (rawFilters) => {
    const filters = normalizeFilters(rawFilters);

    const rows = await db('purchase as p')
      .leftJoin('store as st', 'p.store_id', 'st.id')
      .leftJoin('user as u', 'p.user_id', 'u.id')
      .leftJoin('provider as pr', 'p.provider_id', 'pr.id')
      .modify((query) => applyTransactionFilters(query, 'p', 'p.purchase_date', filters, true))
      .select(
        'p.id',
        'p.store_id',
        'st.name as store_name',
        'p.user_id',
        'u.full_name as user_name',
        'p.provider_id',
        'pr.name as provider_name',
        'p.total',
        'p.purchase_date',
        'p.payment_method',
        'p.status',
        'p.notes',
        'p.created_at',
        'p.updated_at'
      )
      .orderBy('p.purchase_date', 'desc');

    return {
      filters,
      details: rows
    };
  },

  getPurchasesTopProducts: async (rawFilters) => {
    const filters = normalizeFilters(rawFilters);

    const rows = await db('purchase as p')
      .join('purchase_product as pp', 'p.id', 'pp.purchase_id')
      .join('product as prd', 'pp.product_id', 'prd.id')
      .modify((query) => applyTransactionFilters(query, 'p', 'p.purchase_date', filters, true))
      .select(
        'prd.id as product_id',
        'prd.SKU',
        'prd.name as product_name',
        'prd.brand'
      )
      .sum({ total_quantity: 'pp.quantity' })
      .sum({ total_amount: db.raw('pp.quantity * pp.unit_price') })
      .countDistinct({ purchases_count: 'p.id' })
      .groupBy('prd.id', 'prd.SKU', 'prd.name', 'prd.brand')
      .orderBy('total_quantity', 'desc');

    return {
      filters,
      products: rows
    };
  },

  getPurchasesByProvider: async (rawFilters) => {
    const filters = normalizeFilters(rawFilters);

    const rows = await db('purchase as p')
      .leftJoin('provider as pr', 'p.provider_id', 'pr.id')
      .modify((query) => applyTransactionFilters(query, 'p', 'p.purchase_date', filters, true))
      .select(
        'p.provider_id',
        'pr.name as provider_name'
      )
      .countDistinct({ purchases_count: 'p.id' })
      .sum({ total_amount: 'p.total' })
      .groupBy('p.provider_id', 'pr.name')
      .orderBy('total_amount', 'desc');

    return {
      filters,
      providers: rows
    };
  }
};

module.exports = ReportsModel;