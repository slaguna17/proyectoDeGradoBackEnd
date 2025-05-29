const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user-controller');
const AuthMiddleware = require('../middleware/auth-middleware');


// Definir rutas y asignarlas a métodos del controlador

//CRUD
router.get('/', UserController.getUsers);
router.get('/:id', UserController.getUserById);
router.post('/register', UserController.createUser);
router.put('/updateUser/:id', UserController.updateUser);
router.delete('/deleteUser/:id', UserController.deleteUser); 

//Login y Token
router.post("/login",UserController.login);

//PROTECTED ROUTE GET
router.get("/login/userInfoByToken", AuthMiddleware.verifyToken, UserController.getUserInfo);

//Roles
router.get("/default/roles", UserController.getRoles);

//Employees
router.post('/employees', UserController.createEmployee);
router.get('/search/employees', UserController.searchEmployees);
router.put('/:id/assign-schedule', UserController.assignSchedule);



module.exports = router;