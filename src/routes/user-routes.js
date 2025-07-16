const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user-controller');
const AuthMiddleware = require('../middleware/auth-middleware');

//CRUD
router.get('/', UserController.getUsers);
router.get('/:id', UserController.getUserById);
router.post('/register', UserController.createUser);
router.put('/updateUser/:id', UserController.updateUser);
router.delete('/deleteUser/:id', UserController.deleteUser); 

//Login and Authorization
router.post("/login",UserController.login);
router.get("/login/userInfoByToken", AuthMiddleware.verifyToken, UserController.getUserInfo);
router.put('/changePassword/:id', UserController.changePassword);
router.post('/forgotPassword', UserController.forgotPassword);
router.post('/resetPassword', UserController.resetPassword);

//Roles
router.get("/default/roles", UserController.getRoles);

//Employees
router.post('/employees', UserController.createEmployee);
router.get('/search/employees', UserController.searchEmployees);
router.put('/:id/assign-schedule', UserController.assignSchedule);
router.get('/employeesByStore/:storeId', UserController.getEmployeesByStore);

module.exports = router;