const UserService = require('../services/user-service');

const UserController = {
    getUsers: async (req,res) => {
        try {
            const users = await UserService.getUsers()
            res.status(200).json(users);
        } catch (error) {
            console.error(error.message);
            res.status(500).send("Server error")
        }
    },
    getUserById: async (req, res) => {
      try {
        const user = await UserService.getUserById(req.params.id);
        res.status(200).json(user); // Devuelve la respuesta
      } catch (error) {
        console.error(error.message);
        res.status(404).send("User not found")
      }
    },

    createUser: async (req, res) => {
        try {
            const {
                username,
                password,
                full_name,
                email,
                date_of_birth,
                phone,
                status,
                avatar,
                roleId
            } = req.body;

            const user = await UserService.createUser({
                username,
                password,
                full_name,
                email,
                date_of_birth,
                phone,
                status,
                avatar,
                roleId
            });
            res.status(201).json({
                message: 'Usuario creado exitosamente',
                userId: user.id,
                username: user.username
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Error creating user' });
        }
    },

    updateUser: async(req,res) => {
        try {
            const id = req.params.id;
            const updateBody = req.body;

            const updatedUser = await UserService.updateUser(id, updateBody)
            res.status(201).json(updatedUser)
        } catch (error) {
            console.error(error.message);
            res.status(404).send("User not found")
        }
    },

    deleteUser: async(req, res) => {
        try {
            const id = req.params.id
            const deleteUser = await UserService.deleteUser(id)
            res.status(200).json(deleteUser)
        } catch (error) {
            console.error(error.message);
            res.status(404).send("User not found")
        }
    },

    login: async (req, res) => {
        try {
            const {email, password} = req.body
            const token = await UserService.login(email, password)
            res.status(200).json({token})
        } catch (error) {
            console.error(error.message);
            res.status(500).send("Server error")
        }
    },

    getUserInfo: async (req, res) =>{
        try {
            res.status(200).json({user: req.user});
        } catch (error) {
            console.error("Token Verification failed:", error.message);
            res.status(401).send("Invalid Token")
        }
    },
    
    getRoles: async (req,res) => {
        try {
            const roles = await UserService.getRoles()
            res.status(200).json(roles);
        } catch (error) {
            console.error(error.message);
            res.status(500).send("Server error")
        }
    },

    createEmployee: async (req, res) => {
        try {
            const {
            username,
            password,
            full_name,
            email,
            date_of_birth,
            phone,
            status,
            avatar,
            roleId,
            storeId,
            shiftId
            } = req.body;

            const user = await UserService.createEmployee({
            username,
            password,
            full_name,
            email,
            date_of_birth,
            phone,
            status,
            avatar,
            roleId,
            storeId,
            shiftId
            });

            res.status(201).json({
            message: 'Empleado creado exitosamente',
            userId: user.id
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al crear el empleado' });
        }
    },


    searchEmployees: async (req, res) => {
        try {
            const query = req.query.query || '';
            const employees = await UserService.searchUsersByRole(query);
            res.status(200).json(employees);
        } catch (error) {
            console.error(error.message);
            res.status(500).send("Server error");
        }
    }
,

    assignSchedule: async (req, res) => {
        try {
            const { shift_id, store_id } = req.body;
            const user_id = req.params.id;
            await UserService.assignUserToShiftStore(user_id, shift_id, store_id);
            res.status(200).json({ message: 'Asignación exitosa' });
        } catch (error) {
            console.error(error.message);
            res.status(500).json({ error: 'Error en asignación de horario' });
        }
    }


  };



module.exports = UserController;