const ScheduleService = require('../services/schedule-service');

const ScheduleController = {

    getAllSchedules: async (req, res) => {
        try {
        const schedules = await ScheduleService.getAllSchedules();
        res.status(200).json(schedules);
        } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error retrieving schedule' });
        }
    },

    getScheduleById: async (req, res) => {
      try {
        const schedule = await ScheduleService.getScheduleById(req.params.id);
        res.status(200).json(schedule);
      } catch (error) {
        console.error(error.message);
        res.status(404).send("Schedule not found")
      }
    },

    createSchedule: async (req, res) => {
        const { name, start_time, end_time } = req.body;

        if (!name || !start_time || !end_time) {
            return res.status(400).json({ error: 'All fields are required: name, start_time, end_time' });
        }

        try {
            const newSchedule = await ScheduleService.createSchedule({ name, start_time, end_time });
            res.status(201).json({ message: 'Schedule created successfully', schedule: newSchedule });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error creating schedule' });
        }
    },

    updateSchedule: async (req, res) => {
        const { id } = req.params;
        const { name, start_time, end_time } = req.body;

        if (!name || !start_time || !end_time) {
            return res.status(400).json({ error: 'All fields are required: name, start_time, end_time' });
        }

        try {
            const updated = await ScheduleService.updateSchedule(id, { name, start_time, end_time });

            if (updated) {
                res.status(200).json({ message: 'Schedule updated successfully' });
            } else {
               res.status(404).json({ error: 'Schedule not found' });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error updating schedule' });
        }
    },

    deleteSchedule: async (req, res) => {
        const { id } = req.params;

        try {
            const deleted = await ScheduleService.deleteSchedule(id);

            if (deleted === 'assigned') {
                return res.status(400).json({ error: 'Cannot delete schedule: it is assigned to users' });
            }

            if (deleted) {
                return res.status(200).json({ message: 'Schedule deleted successfully' });
            } else {
                return res.status(404).json({ error: 'Schedule not found' });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error deleting schedule' });
        }
    }

};

module.exports = ScheduleController;