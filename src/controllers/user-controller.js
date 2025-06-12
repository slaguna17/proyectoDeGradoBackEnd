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
        const { id } = req.params;

        try {
            const user = await UserService.getUserById(id);

            if (user) {
                res.status(200).json(user);
            } else {
                res.status(404).json({ message: 'User not found' });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error obtaining user' });
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

    updateUser: async (req, res) => {
        const { id } = req.params;
        const updatableFields = [
            'full_name',
            'email',
            'phone',
            'avatar',
            'date_of_birth',
            'status'
        ];

        const updateData = {};

        updatableFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        });

        try {
            const updated = await UserService.updateUser(id, updateData);

            if (updated) {
            res.status(200).json({ message: 'User updated successfully' });
            } else {
            res.status(404).json({ message: 'User not found' });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error updating user' });
        }
    },

    changePassword: async (req, res) => {
        const { id } = req.params;
        const { newPassword } = req.body;

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ error: 'Password must have minimum 6 characters' });
        }

        try {
            const updated = await UserService.changePassword(id, newPassword);

            if (updated) {
                res.status(200).json({ message: 'Successfully changed password' });
            } else {
                res.status(404).json({ error: 'User not found' });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error changing password' });
        }
    },


    deleteUser: async (req, res) => {
        const { id } = req.params;
        try {
            const deleted = await UserService.deleteUser(id);
            if (deleted) {
                res.status(200).json({ message: 'User deleted successfully' });
            } else {
                res.status(404).json({ message: 'User not found' });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error deleting user' });
        }
    },

    login: async (req, res) => {
        try {
            const {email, password} = req.body
            const token = await UserService.login(email, password)
            res.status(200).json({token})
        } catch (error) {
            console.error(error.message);
            res.status(500).send({ message: `Server error: ${error.message}` });
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

    getEmployeesByStore: async (req, res) => {
        const { storeId } = req.params;

        try {
            const employees = await UserService.getEmployeesByStore(storeId);
            res.status(200).json(employees);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error obtaining employees' });
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