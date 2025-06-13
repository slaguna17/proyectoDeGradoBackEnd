const express = require('express');
const router = express.Router();
const PermitController = require('../controllers/permit-controller');

router.get('/', PermitController.getAllPermits);
router.get('/:id', PermitController.getPermitById);
router.post('/createPermit', PermitController.createPermit);
router.put('/updatePermit/:id', PermitController.updatePermit);
router.delete('/deletePermit/:id', PermitController.deletePermit);

module.exports = router;