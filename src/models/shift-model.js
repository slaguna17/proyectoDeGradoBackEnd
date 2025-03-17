const db = require('../config/db')

const ShiftModel = {
    getShifts: async () => {
        return db('shift').select('*')
    },
    getShiftById: async (id) => {
        return db('shift').where({ id }).first();
    },

    createShift: async (shiftData) => {
        const [newShift] = await db('shift').insert(shiftData).returning('*');
        return newShift
    },

    updateShift: async(id,updateBody) => {
        const updatedShift = await db('shift').where({id}).update(updateBody).returning('*')
        return updatedShift[0]
    },
    
    deleteShift: async(id) => {
        return await db('shift').where({id}).del();
    }
}

module.exports = ShiftModel;