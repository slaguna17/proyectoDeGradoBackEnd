const UserService = require('../services/user-service');
const crypto = require('crypto');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

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
            const result = await UserService.login(email, password)
            res.status(200).json(result);
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

    forgotPassword: async (req, res) => {
        try {
            const { email } = req.body;
            if (!email) return res.status(400).json({ error: "Email is required" });

            const user = await UserService.findByEmail(email);
            if (!user) {
                return res.status(200).json({ message: "If mail is available, instructions will be sent." });
            }

            // Generates token and expires in 1 hour
            const token = crypto.randomBytes(32).toString('hex');
            const expires = new Date(Date.now() + 60 * 60 * 1000);
            await UserService.savePasswordResetToken(user.id, token, expires);

            // Send email
            // const resetLink = `${FRONTEND_URL}/reset-password?token=${token}`;
            // await sendResetEmail(user.email, resetLink); // <-- Integración real
            // console.log(`Reset password link for ${user.email}: ${resetLink}`);

            res.status(200).json({ message: "If mail is available, instructions will be sent." });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Error sending recovery mail" });
        }
    },

    resetPassword: async (req, res) => {
        try {
            const { token, newPassword } = req.body;
            if (!token || !newPassword) return res.status(400).json({ error: "Some Data is missing" });
            if (newPassword.length < 6) return res.status(400).json({ error: "Password must have at least 6 characters" });

            const user = await UserService.findByResetToken(token);
            if (!user || new Date(user.reset_expires) < new Date()) {
                return res.status(400).json({ error: "Expired or invalid token" });
            }

            await UserService.changePassword(user.id, newPassword);
            await UserService.clearPasswordResetToken(user.id);

            res.status(200).json({ message: "Password changed successfully" });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Error reseteando contraseña" });
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

    getAllEmployees: async (req, res) => {
        try {
            const employees = await UserService.getAllEmployees();
            res.status(200).json(employees);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error obtaining all employees' });
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
                scheduleId
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
                scheduleId
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
    },

    assignSchedule: async (req, res) => {
        try {
            const { schedule_id, store_id } = req.body;
            const user_id = req.params.id;
            await UserService.assignUserToScheduleStore(user_id, schedule_id, store_id);
            res.status(200).json({ message: 'Asignación exitosa' });
        } catch (error) {
            console.error(error.message);
            res.status(500).json({ error: 'Error en asignación de horario' });
        }
    }
  };

module.exports = UserController;