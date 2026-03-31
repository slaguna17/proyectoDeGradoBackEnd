const SalesService = require('../services/sales-service');

const SalesController = {
    registerSale: async (req, res) => {
        try {
            const result = await SalesService.registerSale(req.body);

            return res.status(201).json({
                message: 'Sale registered successfully',
                sale: result
            });
        } catch (error) {
            console.error('registerSale error:', error);

            const status = error.status || 500;
            const code = error.code || 'REGISTER_SALE_ERROR';
            const message = error.message || 'Error registering sale';
            const details = error.details || null;

            return res.status(status).json({
                error: message,
                code,
                details
            });
        }
    },

    getAllSales: async (req, res) => {
        try {
            const sales = await SalesService.getAllSales();
            return res.json(sales);
        } catch (error) {
            return res.status(500).json({ error: 'Error fetching sales' });
        }
    },

    getSaleById: async (req, res) => {
        try {
            const sale = await SalesService.getSaleById(req.params.id);
            return res.json(sale);
        } catch (error) {
            return res.status(500).json({ error: 'Error fetching sale' });
        }
    },

    getSalesByStore: async (req, res) => {
        try {
            const sales = await SalesService.getSalesByStore(req.params.storeId);
            return res.json(sales);
        } catch (error) {
            return res.status(500).json({ error: 'Error fetching sales by store' });
        }
    },

    getSalesByUser: async (req, res) => {
        try {
            const sales = await SalesService.getSalesByUser(req.params.userId);
            return res.json(sales);
        } catch (error) {
            return res.status(500).json({ error: 'Error fetching sales by user' });
        }
    },

    updateSale: async (req, res) => {
        try {
            const result = await SalesService.updateSale(req.params.id, req.body);
            return res.json({ message: 'Sale updated successfully', sale: result });
        } catch (error) {
            return res.status(500).json({ error: 'Error updating sale' });
        }
    },

    deleteSale: async (req, res) => {
        try {
            await SalesService.deleteSale(req.params.id);
            return res.json({ message: 'Sale deleted successfully' });
        } catch (error) {
            return res.status(500).json({ error: 'Error deleting sale' });
        }
    }
};

module.exports = SalesController;