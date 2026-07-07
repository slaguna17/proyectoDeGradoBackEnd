const db = require('../config/db');
const dayjs = require('dayjs');

const createError = (message, status, code, details) => {
  const err = new Error(message);
  err.status = status;
  if (code) err.code = code;
  if (details) err.details = details;
  return err;
};

const normalizeText = (value) => {
  if (value == null) return null;
  const normalized = String(value).trim().toLowerCase();
  return normalized || null;
};

const normalizePaymentMethod = (value) => normalizeText(value);
const normalizeStatus = (value, fallback) => normalizeText(value) || fallback;

const hasValue = (value) => value !== undefined && value !== null && value !== '';

const validateSaleProducts = (products) => {
  if (!Array.isArray(products) || products.length === 0) {
    throw createError('A sale must have at least one product.', 400, 'EMPTY_SALE_PRODUCTS');
  }

  const seenProductIds = new Set();

  return products.map((product) => {
    const productId = hasValue(product?.product_id) ? Number(product.product_id) : NaN;
    const quantity = hasValue(product?.quantity) ? Number(product.quantity) : NaN;
    const unitPrice = hasValue(product?.unit_price) ? Number(product.unit_price) : NaN;

    if (
      !Number.isSafeInteger(productId) ||
      productId <= 0 ||
      !Number.isSafeInteger(quantity) ||
      quantity <= 0 ||
      !Number.isFinite(unitPrice) ||
      unitPrice < 0
    ) {
      throw createError('Invalid sale product data.', 400, 'INVALID_SALE_PRODUCT');
    }

    if (seenProductIds.has(productId)) {
      throw createError('Duplicate product in sale.', 400, 'DUPLICATE_SALE_PRODUCT', {
        productId
      });
    }

    seenProductIds.add(productId);

    return {
      product_id: productId,
      quantity,
      unit_price: unitPrice
    };
  });
};

const calculateSaleTotal = (products) => products.reduce(
  (sum, product) => sum + Number(product.unit_price) * Number(product.quantity),
  0
);

const toQuantityMap = (products) => {
  const quantities = new Map();

  for (const product of products) {
    const productId = Number(product.product_id);
    const quantity = Number(product.quantity);
    quantities.set(productId, (quantities.get(productId) || 0) + quantity);
  }

  return quantities;
};

const calculateStockDeltas = (oldProducts, newProducts) => {
  const oldQuantities = toQuantityMap(oldProducts);
  const newQuantities = toQuantityMap(newProducts);
  const productIds = new Set([...oldQuantities.keys(), ...newQuantities.keys()]);
  const deltas = new Map();

  for (const productId of productIds) {
    const delta = (newQuantities.get(productId) || 0) - (oldQuantities.get(productId) || 0);
    if (delta !== 0) deltas.set(productId, delta);
  }

  return deltas;
};

const getInventoryRow = async (trx, storeId, productId) => {
  return trx('store_product as sp')
    .join('product as p', 'sp.product_id', 'p.id')
    .select(
      'sp.store_id',
      'sp.product_id',
      'sp.stock',
      'p.name'
    )
    .where({
      'sp.store_id': storeId,
      'sp.product_id': productId
    })
    .forUpdate()
    .first();
};

const validateStockIncrements = async (trx, storeId, deltas) => {
  for (const [productId, delta] of deltas.entries()) {
    if (delta <= 0) continue;

    const inventoryRow = await getInventoryRow(trx, storeId, productId);

    if (!inventoryRow) {
      throw createError('The product does not exist in the inventory of this store.', 404, 'PRODUCT_NOT_FOUND_IN_STORE_INVENTORY', {
        storeId,
        productId
      });
    }

    const availableStock = Number(inventoryRow.stock);
    const missingQuantity = delta - availableStock;

    if (availableStock < delta) {
      throw createError('Insufficient stock for this product in the store.', 409, 'INSUFFICIENT_STOCK', {
        storeId,
        productId,
        productName: inventoryRow.name,
        availableStock,
        requestedQuantity: delta,
        missingQuantity
      });
    }
  }
};

const applyStockDeltas = async (trx, storeId, deltas) => {
  for (const [productId, delta] of deltas.entries()) {
    if (delta > 0) {
      const affectedRows = await trx('store_product')
        .where({
          store_id: storeId,
          product_id: productId
        })
        .where('stock', '>=', delta)
        .decrement('stock', delta);

      if (!affectedRows) {
        throw createError('Insufficient stock for this product in the store.', 409, 'INSUFFICIENT_STOCK', {
          storeId,
          productId,
          requestedQuantity: delta
        });
      }
    }

    if (delta < 0) {
      const affectedRows = await trx('store_product')
        .where({
          store_id: storeId,
          product_id: productId
        })
        .increment('stock', Math.abs(delta));

      if (!affectedRows) {
        throw createError('The product does not exist in the inventory of this store.', 404, 'PRODUCT_NOT_FOUND_IN_STORE_INVENTORY', {
          storeId,
          productId
        });
      }
    }
  }
};

const updateSaleCashMovement = async (trx, saleId, amount, paymentMethod) => {
  const paymentLabel = paymentMethod || 'unknown';
  const updateData = {
    amount,
    notes: `Sale #${saleId} (${paymentLabel})`,
    updated_at: trx.fn.now()
  };

  const updatedByOrigin = await trx('cash_movement')
    .where({
      origin_type: 'SALE',
      origin_id: saleId
    })
    .update(updateData);

  if (updatedByOrigin) return updatedByOrigin;

  return trx('cash_movement')
    .where((query) => {
      query
        .where('notes', 'like', `Sale #${saleId} (%`)
        .orWhere('notes', 'like', `Ingreso por Venta #${saleId} (%`)
        .orWhere('notes', 'like', `Venta #${saleId} (%`);
    })
    .update(updateData);
};

const deleteSaleCashMovement = async (trx, saleId) => {
  const deletedByOrigin = await trx('cash_movement')
    .where({
      origin_type: 'SALE',
      origin_id: saleId
    })
    .del();

  if (deletedByOrigin) return deletedByOrigin;

  return trx('cash_movement')
    .where((query) => {
      query
        .where('notes', 'like', `Sale #${saleId} (%`)
        .orWhere('notes', 'like', `Ingreso por Venta #${saleId} (%`)
        .orWhere('notes', 'like', `Venta #${saleId} (%`);
    })
    .del();
};

const SalesModel = {
  registerSale: async (saleData) => {
    const { user_id, store_id, payment_method, notes, products } = saleData;
    const normalizedProducts = validateSaleProducts(products);
    const normalizedPaymentMethod = normalizePaymentMethod(payment_method);
    const normalizedStatus = normalizeStatus(saleData.status, 'completed');

    return db.transaction(async trx => {
      const today = dayjs().format('YYYY-MM-DD');

      const cashSession = await trx('cash_session')
        .where({ store_id, opened_on: today, status: 'open' })
        .first();

      if (!cashSession) {
        throw createError('There is not an opened cashbox session to register the sale.', 409, 'CASH_SESSION_NOT_OPEN');
      }

      const inventoryDeltas = new Map(
        normalizedProducts.map((product) => [product.product_id, product.quantity])
      );

      await validateStockIncrements(trx, store_id, inventoryDeltas);

      const total = calculateSaleTotal(normalizedProducts);

      const [sale] = await trx('sales')
        .insert({
          store_id,
          user_id,
          total,
          sale_date: trx.fn.now(),
          payment_method: normalizedPaymentMethod,
          status: normalizedStatus,
          notes: notes || ''
        })
        .returning('*');

      for (const product of normalizedProducts) {
        await trx('sales_product').insert({
          sales_id: sale.id,
          product_id: product.product_id,
          quantity: product.quantity,
          unit_price: product.unit_price
        });
      }

      await applyStockDeltas(trx, store_id, inventoryDeltas);

      await trx('cash_movement').insert({
        store_id,
        cash_session_id: cashSession.id,
        user_id,
        direction: 'IN',
        amount: total,
        category: 'Ventas',
        notes: `Sale #${sale.id} (${normalizedPaymentMethod || 'unknown'})`,
        origin_type: 'SALE',
        origin_id: sale.id
      });

      const saleDetails = await trx('sales_product')
        .where('sales_id', sale.id);

      return { ...sale, products: saleDetails };
    });
  },

  updateSale: async (id, { products, payment_method, status }) => {
    const hasProductUpdate = products !== undefined;
    const normalizedProducts = hasProductUpdate ? validateSaleProducts(products) : null;

    return await db.transaction(async trx => {
      const currentSale = await trx('sales')
        .where({ id })
        .forUpdate()
        .first();

      if (!currentSale) {
        throw createError('Sale not found.', 404, 'SALE_NOT_FOUND');
      }

      const updateData = {
        updated_at: trx.fn.now()
      };

      if (payment_method !== undefined) {
        updateData.payment_method = normalizePaymentMethod(payment_method);
      }

      if (status !== undefined) {
        updateData.status = normalizeStatus(status, currentSale.status || 'completed');
      }

      let total = Number(currentSale.total || 0);

      if (hasProductUpdate) {
        const currentDetails = await trx('sales_product')
          .where({ sales_id: id })
          .forUpdate();
        const stockDeltas = calculateStockDeltas(currentDetails, normalizedProducts);

        await validateStockIncrements(trx, currentSale.store_id, stockDeltas);
        await applyStockDeltas(trx, currentSale.store_id, stockDeltas);

        total = calculateSaleTotal(normalizedProducts);
        updateData.total = total;

        await trx('sales_product').where({ sales_id: id }).del();

        const newDetails = normalizedProducts.map(p => ({
          sales_id: id,
          product_id: p.product_id,
          quantity: p.quantity,
          unit_price: p.unit_price
        }));

        await trx('sales_product').insert(newDetails);
      }

      const [updated] = await trx('sales')
        .where({ id })
        .update(updateData)
        .returning('*');

      await updateSaleCashMovement(
        trx,
        id,
        total,
        updateData.payment_method !== undefined ? updateData.payment_method : currentSale.payment_method
      );

      const saleDetails = await trx('sales_product')
        .where('sales_id', id);

      return { ...updated, products: saleDetails };
    });
  },

  getAllSales: async () => {
    return await db('sales').select('*');
  },

  getSaleById: async (id) => {
    const sale = await db('sales').where({ id }).first();

    const details = await db('sales_product')
      .join('product', 'sales_product.product_id', 'product.id')
      .select('product.name', 'sales_product.quantity', 'sales_product.unit_price')
      .where('sales_product.sales_id', id);

    return { ...sale, products: details };
  },

  getSalesByStore: async (storeId) => {
    return await db('sales').where({ store_id: storeId });
  },

  getSalesByUser: async (userId) => {
    return await db('sales').where({ user_id: userId });
  },

  deleteSale: async (id) => {
    return await db.transaction(async trx => {
      const sale = await trx('sales')
        .where({ id })
        .forUpdate()
        .first();

      if (!sale) {
        throw createError('Sale not found.', 404, 'SALE_NOT_FOUND');
      }

      const saleDetails = await trx('sales_product')
        .where({ sales_id: id })
        .forUpdate();

      const restoreDeltas = new Map(
        Array.from(toQuantityMap(saleDetails).entries()).map(([productId, quantity]) => [productId, -quantity])
      );

      await applyStockDeltas(trx, sale.store_id, restoreDeltas);
      await deleteSaleCashMovement(trx, id);
      await trx('sales_product').where({ sales_id: id }).del();
      await trx('sales').where({ id }).del();

      return true;
    });
  }
};

module.exports = SalesModel;
