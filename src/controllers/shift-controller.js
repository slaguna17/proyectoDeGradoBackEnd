const ShiftService = require('../services/shift-service');

const ShiftController = {
    getShifts: async (req,res) => {
        try {
            const shifts = await ShiftService.getShifts()
            res.status(200).json(shifts);
        } catch (error) {
            console.error(error.message);
            res.status(500).send("Server error, couldn't get Shifts")
        }
    },
    getShiftById: async (req, res) => {
      try {
        const shift = await ShiftService.getShiftById(req.params.id);
        res.status(200).json(shift);
      } catch (error) {
        console.error(error.message);
        res.status(404).send("Shift not found")
      }
    },

    createShift: async(req,res) => {
        try {
            const newShift = await ShiftService.createShift(req.body);
            res.status(200).json(newShift)
        } catch (error) {
            console.error(error.message);
            res.status(500).send("Server error, couldn't create Shift")
        }
    },

    updateShift: async(req,res) => {
        try {
            const updatedShift = await ShiftService.updateShift(req.params.id, req.body)
            res.status(200).json(updatedShift)
        } catch (error) {
            console.error(error.message);
            res.status(404).send("Couldn't update, Shift not found")
        }
    },

    deleteShift: async(req, res) => {
        try {
            await ShiftService.deleteShift(req.params.id)
            res.status(200).json({message: "Shift deleted successfully"})
        } catch (error) {
            console.error(error.message);
            res.status(404).send({ error: "Couldn't delete, Shift not found" })
        }
    }
  };

module.exports = ShiftController;