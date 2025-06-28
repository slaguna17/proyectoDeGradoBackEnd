const ScheduleModel = require('../models/schedule-model');

const ScheduleService = {
    getAllSchedules: async () => {
      return await ScheduleModel.getAllSchedules();
    },

    getScheduleById: async (id) => {
      if (!id) {
        throw new Error('Schedule ID is required');
      }
      const schedule = await ScheduleModel.getScheduleById(id);
      if (!schedule) {
        throw new Error('Schedule not found');
      }
      return schedule;
    },

    createSchedule: async (scheduleData) => {
        return ScheduleModel.createSchedule(scheduleData)
    },

    updateSchedule: async (id, data) => {
      return await ScheduleModel.updateSchedule(id, data);
    },

    deleteSchedule: async (id) => {
      return await ScheduleModel.deleteSchedule(id);
    }

  };

module.exports = ScheduleService;