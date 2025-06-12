const db = require('../config/db');

const PurchaseModel = {
  registerPurchase: async ({
    store_id,
    user_id,
    provider_id,
    products,
    notes,
    purchase_date
  }) => {
    return await db.transaction(async trx => {
      // Calcular total
      const purchase_total = products.reduce((sum, p) => sum + p.unit_price * p.quantity, 0);

      // Insertar en purchase
      const [purchase] = await trx('purchase')
        .insert({
          store_id,
          user_id,
          provider_id,
          purchase_total,
          notes,
          purchase_date,
          created_at: trx.fn.now(),
          updated_at: trx.fn.now()
        })
        .returning('*');

      // Insertar detalle en purchase_product
      const purchaseDetails = products.map(p => ({
        purchase_id: purchase.id,
        product_id: p.product_id,
        quantity: p.quantity,
        unit_price: p.unit_price
      }));

      await trx('purchase_product').insert(purchaseDetails);

      // (Opcional) actualizar caja
      await trx('purchase_box').insert({
        store_id,
        user_id,
        purchase_total,
        purchases_count: 1,
        purchase_date,
        created_at: trx.fn.now(),
        updated_at: trx.fn.now()
      });

      return purchase;
    });
  }
};

module.exports = PurchaseModel