const db = require('../config/db');

async function hydrateRelations(products) {
  const ids = products.map(p => p.id);
  if (ids.length === 0) return products;

  const storeRows = await db('store_product as sp')
    .join('store as s', 'sp.store_id', 's.id')
    .whereIn('sp.product_id', ids)
    .select(
      'sp.product_id',
      's.id as store_id',
      's.name as store_name',
      'sp.stock as pivot_stock',
      'sp.expiration_date as pivot_exp'
    );

  const providerRows = await db('provider_product as pp')
    .join('provider as pr', 'pp.provider_id', 'pr.id')
    .whereIn('pp.product_id', ids)
    .select('pp.product_id', 'pr.id as provider_id', 'pr.name as provider_name');

  const storesByProduct = {};
  for (const r of storeRows) {
    (storesByProduct[r.product_id] ||= []).push({
      id: r.store_id,
      name: r.store_name,
      pivot: { stock: r.pivot_stock, expiration_date: r.pivot_exp }
    });
  }

  const providersByProduct = {};
  for (const r of providerRows) {
    (providersByProduct[r.product_id] ||= []).push({
      id: r.provider_id,
      name: r.provider_name
    });
  }

  for (const p of products) {
    p.stores = storesByProduct[p.id] || [];
    p.providers = providersByProduct[p.id] || [];
  }
  return products;
}

const ProductModel = {

  // Listado general con stores[].pivot + providers[]
  getAllProductsWithRelations: async () => {
    const products = await db('product').select('*');
    await hydrateRelations(products);
    return products;
  },

  getProductById: async (id) => {
    return db('product').where({ id }).first();
  },

  createProduct: async (productData, storeData) => {
    return await db.transaction(async (trx) => {
      const storeExists = await trx('store').where('id', storeData.store_id).first();
      if (!storeExists) {
        throw new Error(`The store with ID ${storeData.store_id} doesn't exist.`);
      }

      const existingSKU = await trx('product').where('SKU', productData.SKU).first();
      if (existingSKU) {
        throw new Error(`A product with SKU ${productData.SKU} already exists.`);
      }

      const [newProduct] = await trx('product').insert(productData).returning('*');

      await trx('store_product').insert({
        store_id: storeData.store_id,
        product_id: newProduct.id,
        stock: storeData.stock ?? 0,
        expiration_date: storeData.expiration_date ?? null
      });

      return newProduct;
    });
  },

  updateProduct: async (id, data) => {
    const updated = await db('product')
      .where({ id })
      .update({ ...data, updated_at: db.fn.now() });
    return updated;
  },

  deleteProduct: async (id) => {
    const usedInSales = await db('sales_product').where({ product_id: id }).first();
    const usedInPurchases = await db('purchase_product').where({ product_id: id }).first();
    if (usedInSales || usedInPurchases) return 'in_use';

    await db('store_product').where({ product_id: id }).del();
    await db('provider_product').where({ product_id: id }).del();
    return await db('product').where({ id }).del();
  },

  getProductsByCategoryWithRelations: async (category_id) => {
    const products = await db('product').where({ category_id }).select('*');
    await hydrateRelations(products);
    return products;
  },

  getProductsByStore: async (storeId) => {
    const rows = await db('store_product as sp')
      .join('product as p', 'sp.product_id', 'p.id')
      .join('store as s', 'sp.store_id', 's.id')
      .where('sp.store_id', storeId)
      .select(
        'p.*',
        's.id as s_id',
        's.name as s_name',
        'sp.stock as sp_stock',
        'sp.expiration_date as sp_exp'
      );

    const byId = new Map();
    for (const r of rows) {
      if (!byId.has(r.id)) {
        byId.set(r.id, {
          id: r.id,
          SKU: r.SKU,
          name: r.name,
          description: r.description,
          image: r.image,
          brand: r.brand,
          category_id: r.category_id,
          created_at: r.created_at,
          updated_at: r.updated_at,
          stock: r.sp_stock,
          expiration_date: r.sp_exp,
          stores: [
            {
              id: r.s_id,
              name: r.s_name,
              pivot: { stock: r.sp_stock, expiration_date: r.sp_exp }
            }
          ]
        });
      }
    }
    return Array.from(byId.values());
  },

  // Categoría + tienda
  getProductsByCategoryAndStore: async (categoryId, storeId) => {
    const rows = await db('store_product as sp')
      .join('product as p', 'sp.product_id', 'p.id')
      .join('store as s', 'sp.store_id', 's.id')
      .where('sp.store_id', storeId)
      .andWhere('p.category_id', categoryId)
      .select(
        'p.*',
        's.id as s_id',
        's.name as s_name',
        'sp.stock as sp_stock',
        'sp.expiration_date as sp_exp'
      );

    const byId = new Map();
    for (const r of rows) {
      if (!byId.has(r.id)) {
        byId.set(r.id, {
          id: r.id,
          SKU: r.SKU,
          name: r.name,
          description: r.description,
          image: r.image,
          brand: r.brand,
          category_id: r.category_id,
          created_at: r.created_at,
          updated_at: r.updated_at,
          stock: r.sp_stock,
          expiration_date: r.sp_exp,
          stores: [
            {
              id: r.s_id,
              name: r.s_name,
              pivot: { stock: r.sp_stock, expiration_date: r.sp_exp }
            }
          ]
        });
      }
    }
    return Array.from(byId.values());
  },

  assignRelations: async (productId, storeEntries = [], providerIds = []) => {
    if (storeEntries && storeEntries.length > 0) {
      const normalized = storeEntries.map(entry => {
        if (typeof entry === 'number') {
          return { product_id: productId, store_id: entry, stock: 0, expiration_date: null };
        }
        return {
          product_id: productId,
          store_id: entry.store_id,
          stock: entry.stock ?? 0,
          expiration_date: entry.expiration_date ?? null
        };
      });
      await db('store_product').insert(normalized);
    }

    if (providerIds && providerIds.length > 0) {
      const providerData = providerIds.map(providerId => ({
        product_id: productId,
        provider_id: providerId
      }));
      await db('provider_product').insert(providerData);
    }

    return true;
  }
};

module.exports = ProductModel;
