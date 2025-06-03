const PurchaseService = require('../services/purchase-service');

const PurchaseController = {
    registerPurchase: async (req, res) => {
        try {
            const result = await PurchaseService.registerPurchase(req.body);
            res.status(201).json({ message: 'Purchase registered successfully', purchase: result });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error registering purchase' });
        }
    }
};

module.exports = PurchaseController