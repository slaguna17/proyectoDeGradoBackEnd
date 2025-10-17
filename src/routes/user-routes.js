const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user-controller');
const { verifyToken } = require('../middleware/auth-middleware');

// Empleados y búsquedas
router.get('/employees', UserController.getAllEmployees);
router.get('/search/employees', UserController.searchEmployees || ((_req,res)=>res.status(404).json({message:'Not implemented'})));
router.get('/employeesByStore/:storeId', UserController.getEmployeesByStore);
router.post('/employees', UserController.createEmployee || UserController.createUser);

// Roles
router.get('/default/roles', UserController.getRoles);

// Login y autorización
router.post('/login', UserController.login);
router.get('/login/userInfoByToken', verifyToken, UserController.getUserInfo);
router.get('/me', verifyToken, UserController.getMe);

// CRUD de usuario
router.get('/', UserController.getUsers);
router.post('/register', UserController.createUser);
router.put('/updateUser/:id', UserController.updateUser);
router.delete('/deleteUser/:id', UserController.deleteUser);
router.put('/:id/assign-schedule', UserController.assignSchedule || ((_req,res)=>res.status(404).json({message:'Not implemented'})));
router.put('/:id/update-role', UserController.updateUserRole || ((_req,res)=>res.status(404).json({message:'Not implemented'})));
router.get('/:id', UserController.getUserById);

module.exports = router;
