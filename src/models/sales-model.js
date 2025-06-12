const db = require('../config/db');

const SalesModel = {
    createSaleTransaction: async ({ store_id, user_id, shift_id, products, payment_method }) => {
        return await db.transaction(async trx => {
            // Calcular total
            const totalAmount = products.reduce((sum, p) => sum + (p.quantity * p.unit_price), 0);

            // Insertar en sales_box
            const [sale] = await trx('sales_box')
            .insert({
                store_id,
                user_id,
                shift_id,
                total: totalAmount,
                payment_method
            })
            .returning('*');

            // Insertar en sales_product
            const salesProductsData = products.map(p => ({
            sales_box_id: sale.id,
            product_id: p.product_id,
            quantity: p.quantity,
            unit_price: p.unit_price
            }));
            await trx('sales_product').insert(salesProductsData);

            // Registrar en total_cash
            await trx('cash_summary').insert({
            store_id,
            sales_box_id: sale.id,
            isProfit: true,
            period: 1,
            date: new Date(),
            filters: 'ventas',
            graphs: 'diario'
            });

            return sale;
        });
    }
};

module.exports = SalesModel