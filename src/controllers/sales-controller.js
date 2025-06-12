const SalesService = require('../services/sales-service');

const SalesController = {
    createSale: async (req, res) => {
        try {
            const sale = await SalesService.createSale(req.body);
            res.status(201).json({ message: 'Sale registered successfully', sale });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error registering sale' });
        }
    }

};

module.exports = SalesController