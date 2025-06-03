const ShiftService = require('../services/shift-service');

const ShiftController = {

    getAllShifts: async (req, res) => {
        try {
        const shifts = await ShiftService.getAllShifts();
        res.status(200).json(shifts);
        } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error retrieving schedule' });
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

    createShift: async (req, res) => {
        const { name, start_time, end_time } = req.body;

        if (!name || !start_time || !end_time) {
            return res.status(400).json({ error: 'All fields are required: name, start_time, end_time' });
        }

        try {
            const newShift = await ShiftService.createShift({ name, start_time, end_time });
            res.status(201).json({ message: 'Shift created successfully', shift: newShift });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error creating shift' });
        }
    },

    updateShift: async (req, res) => {
        const { id } = req.params;
        const { name, start_time, end_time } = req.body;

        if (!name || !start_time || !end_time) {
            return res.status(400).json({ error: 'All fields are required: name, start_time, end_time' });
        }

        try {
            const updated = await ShiftService.updateShift(id, { name, start_time, end_time });

            if (updated) {
                res.status(200).json({ message: 'Shift updated successfully' });
            } else {
               res.status(404).json({ error: 'Shift not found' });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error updating shift' });
        }
    },

    deleteShift: async (req, res) => {
        const { id } = req.params;

        try {
            const deleted = await ShiftService.deleteShift(id);

            if (deleted === 'assigned') {
                return res.status(400).json({ error: 'Cannot delete shift: it is assigned to users' });
            }

            if (deleted) {
                return res.status(200).json({ message: 'Shift deleted successfully' });
            } else {
                return res.status(404).json({ error: 'Shift not found' });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error deleting shift' });
        }
    }

};

module.exports = ShiftController;