const ShiftModel = require('../models/shift-model');

const ShiftService = {
    getAllShifts: async () => {
      return await ShiftModel.getAllShifts();
    },

    getShiftById: async (id) => {
      if (!id) {
        throw new Error('Shift ID is required');
      }
      const shift = await ShiftModel.getShiftById(id);
      if (!shift) {
        throw new Error('Shift not found');
      }
      return shift;
    },

    createShift: async (shiftData) => {
        return ShiftModel.createShift(shiftData)
    },

    updateShift: async (id, data) => {
      return await ShiftModel.updateShift(id, data);
    },

    deleteShift: async (id) => {
      return await ShiftModel.deleteShift(id);
    }

  };

module.exports = ShiftService;