const ShiftModel = require('../models/shift-model');

const ShiftService = {
    getShifts: async () => {
        const shifts = await ShiftModel.getShifts();
        return shifts;
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

    updateShift: async (id, updateBody) => {
        const shift = await ShiftModel.updateShift(id, updateBody)
        if(!shift){
            throw new Error("Shift not found")
        }
        return shift; 
    },

    deleteShift: async (id) => {
        if (!id) {
            throw new Error('Shift ID is required');
        }
        const shift = await ShiftModel.deleteShift(id);
        if (!shift) {
            throw new Error('Shift not found');
        }
        return { message: "Shift deleted successfully" };
    }

  };

module.exports = ShiftService;