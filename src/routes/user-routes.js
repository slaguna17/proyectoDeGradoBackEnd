const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user-controller');
const AuthMiddleware = require('../middleware/auth-middleware');

// Empleados y búsquedas (más específicas siempre primero)
router.get('/employees', UserController.getAllEmployees);
router.get('/search/employees', UserController.searchEmployees);
router.get('/employeesByStore/:storeId', UserController.getEmployeesByStore);
router.post('/employees', UserController.createEmployee);

// Roles
router.get('/default/roles', UserController.getRoles);

// Login y autorización
router.post("/login", UserController.login);
router.get("/login/userInfoByToken", AuthMiddleware.verifyToken, UserController.getUserInfo);
router.put('/changePassword/:id', UserController.changePassword);
router.post('/forgotPassword', UserController.forgotPassword);
router.post('/resetPassword', UserController.resetPassword);

// CRUD de usuario (los de parámetros al final)
router.get('/', UserController.getUsers);
router.post('/register', UserController.createUser);
router.put('/updateUser/:id', UserController.updateUser);
router.delete('/deleteUser/:id', UserController.deleteUser);
router.put('/:id/assign-schedule', UserController.assignSchedule);
router.get('/:id', UserController.getUserById); // SIEMPRE al final

module.exports = router;
