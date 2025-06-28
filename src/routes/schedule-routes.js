const express = require('express');
const router = express.Router();
const ScheduleController = require('../controllers/schedule-controller');

// CRUD
router.get('/', ScheduleController.getAllSchedules);
router.get('/:id', ScheduleController.getScheduleById);
router.post('/createSchedule', ScheduleController.createSchedule);
router.put('/updateSchedule/:id', ScheduleController.updateSchedule);
router.delete('/deleteSchedule/:id', ScheduleController.deleteSchedule); 

module.exports = router;