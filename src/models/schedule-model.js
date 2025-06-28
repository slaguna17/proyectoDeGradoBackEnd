const db = require('../config/db');
const moment = require('moment');

const ScheduleModel = {

    getAllSchedules: async () => {
        return await db('schedule').select('*');
    },

    getScheduleById: async (id) => {
        return db('schedule').where({ id }).first();
    },

    createSchedule: async ({ name, start_time, end_time }) => {
        const start = moment(start_time, 'HH:mm');
        const end = moment(end_time, 'HH:mm');

        const minutes = end.diff(start, 'minutes');
        if (minutes <= 0) {
            throw new Error('End time must be after start time');
        }

        const length = parseFloat((minutes / 60).toFixed(2));

        const [schedule] = await db('schedule')
            .insert({ name, start_time, end_time, length })
            .returning(['id', 'name', 'start_time', 'end_time', 'length']);

        return schedule;
    },

    updateSchedule: async (id, { name, start_time, end_time }) => {
        const start = moment(start_time, 'HH:mm');
        const end = moment(end_time, 'HH:mm');

        const minutes = end.diff(start, 'minutes');
        if (minutes <= 0) {
            throw new Error('End time must be after start time');
        }

        const length = parseFloat((minutes / 60).toFixed(2));

        const updated = await db('schedule')
            .where({ id })
            .update({
                name,
                start_time,
                end_time,
                length,
                updated_at: db.fn.now()
            });

        return updated;
    },
    
    deleteSchedule: async(id) => {
        return await db('schedule').where({id}).del();
    }
}

module.exports = ScheduleModel;