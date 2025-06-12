const express = require('express');
const router = express.Router();
const RoleController = require('../controllers/role-controller');

//CRUD
router.get('/', RoleController.getAllRoles);
router.get('/:id', RoleController.getRoleById);
router.post('/createRole', RoleController.createRole);
router.put('/updateRole/:id', RoleController.updateRole);
router.delete('/deleteRole/:id', RoleController.deleteRole);

//PERMITS
router.get('/:id/permits', RoleController.getPermitsByRole);
router.post('/:id/assignPermit', RoleController.assignPermitsToRole);
router.delete('/:id/removeAllPermitsFromRole', RoleController.removeAllPermitsFromRole);

module.exports = router;