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
  getAllProductsWithRelations: async () => {
    const products = await db('product').select('*');
    await hydrateRelations(products);
    return products;
  },
  getProductById: async (id) => {
    const product = await db('product').where({ id }).first();
    
    if (!product) {
      return undefined;
    }

    const [hydratedProduct] = await hydrateRelations([product]);
    return hydratedProduct;
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
    return db('product')
      .where({ id })
      .update({ ...data, updated_at: db.fn.now() });
  },
  deleteProduct: async (id) => {
    const usedInSales = await db('sales_product').where({ product_id: id }).first();
    const usedInPurchases = await db('purchase_product').where({ product_id: id }).first();
    if (usedInSales || usedInPurchases) return 'in_use';
    await db('store_product').where({ product_id: id }).del();
    await db('provider_product').where({ product_id: id }).del();
    return db('product').where({ id }).del();
  },
  getProductsByCategoryWithRelations: async (category_id) => {
    const products = await db('product').where({ category_id }).select('*');
    await hydrateRelations(products);
    return products;
  },
  getProductsByStore: async (storeId) => {
    const products = await db('product as p')
      .join('store_product as sp', 'sp.product_id', 'p.id')
      .where('sp.store_id', storeId)
      .select('p.*');
    return hydrateRelations(products);
},
  getProductsByCategoryAndStore: async (categoryId, storeId) => {
    const products = await db('product as p')
      .join('store_product as sp', 'sp.product_id', 'p.id')
      .where('sp.store_id', storeId)
      .andWhere('p.category_id', categoryId)
      .select('p.*');
    return hydrateRelations(products);
},
  assignRelations: async (productId, storeEntries = [], providerIds = []) => {
    if (storeEntries && storeEntries.length > 0) {
      const normalized = storeEntries.map(entry => ({
        product_id: productId,
        store_id: typeof entry === 'number' ? entry : entry.store_id,
        stock: entry.stock ?? 0,
        expiration_date: entry.expiration_date ?? null
      }));
      await db('store_product').insert(normalized).onConflict(['store_id', 'product_id']).ignore();
    }
    if (providerIds && providerIds.length > 0) {
      const providerData = providerIds.map(providerId => ({
        product_id: productId,
        provider_id: providerId
      }));
      await db('provider_product').insert(providerData).onConflict(['provider_id', 'product_id']).ignore();
    }
    return true;
  },

  upsertStoreProduct: async ({ storeId, productId, stock, expirationDate }) => {
    return db('store_product')
      .insert({
        store_id: storeId,
        product_id: productId,
        stock: stock,
        expiration_date: expirationDate || null,
      })
      .onConflict(['store_id', 'product_id'])
      .merge();
  },

  removeStoreProduct: async ({ storeId, productId }) => {
    return db('store_product')
      .where({ store_id: storeId, product_id: productId })
      .del();
  },
};

module.exports = ProductModel;