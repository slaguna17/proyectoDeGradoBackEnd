const db = require('../config/db');
const moment = require('moment');

const ShiftModel = {

    getAllShifts: async () => {
        return await db('shift').select('*');
    },

    getShiftById: async (id) => {
        return db('shift').where({ id }).first();
    },

    createShift: async ({ name, start_time, end_time }) => {
        const start = moment(start_time, 'HH:mm');
        const end = moment(end_time, 'HH:mm');

        const minutes = end.diff(start, 'minutes');
        if (minutes <= 0) {
            throw new Error('End time must be after start time');
        }

        const length = parseFloat((minutes / 60).toFixed(2));

        const [shift] = await db('shift')
            .insert({ name, start_time, end_time, length })
            .returning(['id', 'name', 'start_time', 'end_time', 'length']);

        return shift;
    },

    updateShift: async (id, { name, start_time, end_time }) => {
        const start = moment(start_time, 'HH:mm');
        const end = moment(end_time, 'HH:mm');

        const minutes = end.diff(start, 'minutes');
        if (minutes <= 0) {
            throw new Error('End time must be after start time');
        }

        const length = parseFloat((minutes / 60).toFixed(2));

        const updated = await db('shift')
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
    
    deleteShift: async(id) => {
        return await db('shift').where({id}).del();
    }
}

module.exports = ShiftModel;