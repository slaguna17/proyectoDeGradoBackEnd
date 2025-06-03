const express = require('express');
const router = express.Router();
const ShiftController = require('../controllers/shift-controller');

// CRUD
router.get('/', ShiftController.getAllShifts);
router.get('/:id', ShiftController.getShiftById);
router.post('/createShift', ShiftController.createShift);
router.put('/updateShift/:id', ShiftController.updateShift);
router.delete('/deleteShift/:id', ShiftController.deleteShift); 

module.exports = router;