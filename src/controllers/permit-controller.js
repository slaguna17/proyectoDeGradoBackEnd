const PermitService = require('../services/permit-service');

const PermitController = {
    getAllPermits: async (req, res) => {
        try {
            const permits = await PermitService.getAllPermits();
            res.json(permits);
        } catch (error) {
            res.status(500).json({ error: 'Error fetching permits' });
        }
    },

    getPermitById: async (req, res) => {
        try {
            const permit = await PermitService.getPermitById(req.params.id);
            res.json(permit);
        } catch (error) {
            res.status(500).json({ error: 'Error fetching permit' });
        }
    },

    createPermit: async (req, res) => {
        try {
            const newPermit = await PermitService.createPermit(req.body);
            res.status(201).json({ message: 'Permit created', permit: newPermit });
        } catch (error) {
            res.status(500).json({ error: 'Error creating permit' });
        }
    },

    updatePermit: async (req, res) => {
        try {
            const updatedPermit = await PermitService.updatePermit(req.params.id, req.body);
            res.json({ message: 'Permit updated', permit: updatedPermit });
        } catch (error) {
            res.status(500).json({ error: 'Error updating permit' });
        }
    },

    deletePermit: async (req, res) => {
        try {
            await PermitService.deletePermit(req.params.id);
            res.json({ message: 'Permit deleted' });
        } catch (error) {
            res.status(500).json({ error: 'Error deleting permit' });
        }
    },
};

module.exports = PermitController;