const SalesService = require('../services/sales-service');

const handleSalesError = (res, error, fallbackMessage, fallbackCode) => {
    const status = error.status || 500;
    return res.status(status).json({
        error: status === 500 ? fallbackMessage : error.message,
        code: error.code || fallbackCode,
        details: error.details || null
    });
};

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
            console.error('updateSale error:', error);
            return handleSalesError(res, error, 'Error updating sale', 'UPDATE_SALE_ERROR');
        }
    },

    deleteSale: async (req, res) => {
        try {
            await SalesService.deleteSale(req.params.id);
            return res.json({ message: 'Sale deleted successfully' });
        } catch (error) {
            console.error('deleteSale error:', error);
            return handleSalesError(res, error, 'Error deleting sale', 'DELETE_SALE_ERROR');
        }
    }
};

module.exports = SalesController;
