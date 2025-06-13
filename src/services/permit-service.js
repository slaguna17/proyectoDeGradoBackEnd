const PermitModel = require('../models/permit-model');

const PermitService = {
    getAllPermits: async () => {
        return await PermitModel.getAllPermits();
    },
    
    getPermitById: async (id) => {
        return await PermitModel.getPermitById(id);
    },
    
    createPermit: async (data) => {
        return await PermitModel.createPermit(data);
    },
    
    updatePermit: async (id, data) => {
        return await PermitModel.updatePermit(id, data);
    },
    
    deletePermit: async (id) => {
        return await PermitModel.deletePermit(id);
    }
};

module.exports = PermitService;
