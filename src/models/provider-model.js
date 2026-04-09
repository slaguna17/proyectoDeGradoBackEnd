const db = require('../config/db');

const getLinkedProductsQuery = (executor, providerId) => {
  return executor('provider_product as pp')
    .join('product as p', 'pp.product_id', 'p.id')
    .leftJoin('category as c', 'p.category_id', 'c.id')
    .where('pp.provider_id', providerId)
    .select(
      'p.id',
      'p.SKU',
      'p.name',
      'p.description',
      'p.image',
      'p.brand',
      'p.sale_price',
      'p.purchase_price',
      'p.category_id',
      'p.created_at',
      'p.updated_at',
      'c.name as category_name'
    )
    .orderBy('p.name', 'asc');
};

const ProviderModel = {
  getAllProviders: async () => {
    return await db('provider').select('*').orderBy('name', 'asc');
  },

  getProviderById: async (id) => {
    const provider = await db('provider').where({ id }).first();

    if (!provider) return undefined;

    provider.products = await getLinkedProductsQuery(db, id);
    return provider;
  },

  providerExists: async (id) => {
    const provider = await db('provider').where({ id }).first();
    return !!provider;
  },

  productExists: async (id) => {
    const product = await db('product').where({ id }).first();
    return !!product;
  },

  countExistingProducts: async (productIds = []) => {
    if (productIds.length === 0) return 0;

    const result = await db('product')
      .whereIn('id', productIds)
      .count('* as total')
      .first();

    return Number(result?.total || 0);
  },

  createProvider: async ({
    name,
    address,
    phone,
    email,
    contact_person_name,
    notes
  }) => {
    const [provider] = await db('provider')
      .insert({
        name,
        address,
        phone,
        email,
        contact_person_name,
        notes,
        created_at: db.fn.now(),
        updated_at: db.fn.now()
      })
      .returning('*');

    return provider;
  },

  updateProvider: async (id, data) => {
    const updated = await db('provider')
      .where({ id })
      .update({
        ...data,
        updated_at: db.fn.now()
      });

    return updated;
  },

  getProductsByProviderId: async (providerId) => {
    return await getLinkedProductsQuery(db, providerId);
  },

  assignProduct: async (providerId, productId) => {
    await db('provider_product')
      .insert({
        provider_id: providerId,
        product_id: productId,
        created_at: db.fn.now(),
        updated_at: db.fn.now()
      })
      .onConflict(['provider_id', 'product_id'])
      .ignore();

    return await getLinkedProductsQuery(db, providerId);
  },

  syncProducts: async (providerId, productIds = []) => {
    return await db.transaction(async (trx) => {
      const uniqueIds = [...new Set(productIds.map(Number).filter(Number.isInteger))];

      await trx('provider_product')
        .where({ provider_id: providerId })
        .del();

      if (uniqueIds.length > 0) {
        await trx('provider_product').insert(
          uniqueIds.map((productId) => ({
            provider_id: providerId,
            product_id: productId,
            created_at: db.fn.now(),
            updated_at: db.fn.now()
          }))
        );
      }

      return await getLinkedProductsQuery(trx, providerId);
    });
  },

  removeProduct: async (providerId, productId) => {
    await db('provider_product')
      .where({
        provider_id: providerId,
        product_id: productId
      })
      .del();

    return await getLinkedProductsQuery(db, providerId);
  },

  deleteProvider: async (id) => {
    const hasProductLinks = await db('provider_product')
      .where({ provider_id: id })
      .first();

    const hasPurchases = await db('purchase')
      .where({ provider_id: id })
      .first();

    if (hasProductLinks || hasPurchases) return 'in_use';

    const deleted = await db('provider')
      .where({ id })
      .del();

    return deleted;
  }
};

module.exports = ProviderModel;