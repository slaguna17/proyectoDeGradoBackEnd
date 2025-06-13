const SalesService = require('../services/sales-service');

const SalesController = {
    registerSale: async (req, res) => {
        try {
            const result = await SalesService.registerSale(req.body);
            res.status(201).json({ message: 'Sale registered successfully', sale: result });
        } catch (error) {
            res.status(500).json({ error: 'Error registering sale' });
        }
    },

    getAllSales: async (req, res) => {
        try {
            const sales = await SalesService.getAllSales();
            res.json(sales);
        } catch (error) {
            res.status(500).json({ error: 'Error fetching sales' });
        }
    },

    getSaleById: async (req, res) => {
        try {
            const sale = await SalesService.getSaleById(req.params.id);
            res.json(sale);
        } catch (error) {
            res.status(500).json({ error: 'Error fetching sale' });
        }
    },

    getSalesByStore: async (req, res) => {
        try {
            const sales = await SalesService.getSalesByStore(req.params.storeId);
            res.json(sales);
        } catch (error) {
            res.status(500).json({ error: 'Error fetching sales by store' });
        }
    },

    getSalesByUser: async (req, res) => {
        try {
            const sales = await SalesService.getSalesByUser(req.params.userId);
            res.json(sales);
        } catch (error) {
            res.status(500).json({ error: 'Error fetching sales by user' });
        }
    },

    updateSale: async (req, res) => {
        try {
            const result = await SalesService.updateSale(req.params.id, req.body);
            res.json({ message: 'Sale updated successfully', sale: result });
        } catch (error) {
            res.status(500).json({ error: 'Error updating sale' });
        }
    },

    deleteSale: async (req, res) => {
        try {
            await SalesService.deleteSale(req.params.id);
            res.json({ message: 'Sale deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: 'Error deleting sale' });
        }
    }
};

module.exports = SalesController;