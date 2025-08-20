const UserService = require('../services/user-service');
const crypto = require('crypto');
const { attachImageUrl, attachImageUrlMany, replaceImageKey } = require('../utils/image-helpers');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

const UserController = {
  // GET /api/users?signed=true
  getUsers: async (req,res) => {
    try {
      const signed = String(req.query.signed).toLowerCase() === 'true';
      const users = await UserService.getUsers();
      const out = await attachImageUrlMany(users, 'avatar', { signed });
      res.status(200).json(out);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server error");
    }
  },

  // GET /api/users/:id?signed=true
  getUserById: async (req, res) => {
    const { id } = req.params;
    try {
      const signed = String(req.query.signed).toLowerCase() === 'true';
      const user = await UserService.getUserById(id);
      if (!user) return res.status(404).json({ message: 'User not found' });
      const out = await attachImageUrl(user, 'avatar', { signed });
      res.status(200).json(out);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error obtaining user' });
    }
  },

  // POST /api/users
  // Acepta avatar como: { avatar_key } o { image_key } o { avatar }
  createUser: async (req, res) => {
    try {
      const {
        username, password, full_name, email, date_of_birth,
        phone, status, avatar, image_key, avatar_key, roleId
      } = req.body;

      const user = await UserService.createUser({
        username,
        password,
        full_name,
        email,
        date_of_birth,
        phone,
        status,
        avatar: avatar_key ?? image_key ?? avatar ?? null  // guardamos SOLO la key
        ,
        roleId
      });

      const out = await attachImageUrl(user, 'avatar', { signed: false });
      res.status(201).json({
        message: 'Usuario creado exitosamente',
        userId: user.id,
        username: user.username,
        user: out
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error creating user' });
    }
  },

  // PUT /api/users/:id  (+ removeImage opcional)
  updateUser: async (req, res) => {
    const { id } = req.params;

    // Campos normales que ya permitías
    const updatableFields = [
      'full_name',
      'email',
      'phone',
      'date_of_birth',
      'status'
    ];

    // Construimos updateData con esos campos
    const updateData = {};
    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) updateData[field] = req.body[field];
    });

    try {
      const prev = await UserService.getUserById(id);
      if (!prev) return res.status(404).json({ message: 'User not found' });

      // Manejo de avatar
      const { avatar, image_key, avatar_key, removeImage = false } = req.body;
      let nextAvatar = prev.avatar ?? null;

      if (removeImage) {
        if (prev.avatar) await replaceImageKey(prev.avatar, null);
        nextAvatar = null;
      } else if (avatar != null || image_key != null || avatar_key != null) {
        nextAvatar = await replaceImageKey(prev.avatar, avatar_key ?? image_key ?? avatar);
      }

      // Solo incluimos avatar si cambió o si se pidió remover
      if (removeImage || avatar != null || image_key != null || avatar_key != null) {
        updateData.avatar = nextAvatar;
      }

      const updated = await UserService.updateUser(id, updateData);
      if (!updated) return res.status(404).json({ message: 'User not found' });

      const fresh = await UserService.getUserById(id);
      const out = await attachImageUrl(fresh, 'avatar', { signed: false });
      res.status(200).json({ message: 'User updated successfully', user: out });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error updating user' });
    }
  },

  deleteUser: async (req, res) => {
    const { id } = req.params;
    try {
      const prev = await UserService.getUserById(id).catch(() => null);
      const deleted = await UserService.deleteUser(id);
      if (!deleted) return res.status(404).json({ message: 'User not found' });

      if (prev?.avatar) {
        try { const { deleteObject } = require('../services/image-service'); await deleteObject(prev.avatar); } catch {}
      }
      res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error deleting user' });
    }
  },

  // ==== lo demás queda igual ====
  login: async (req, res) => {
    try {
      const {email, password} = req.body;
      const result = await UserService.login(email, password);
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
      res.status(401).send("Invalid Token");
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
      if (updated) res.status(200).json({ message: 'Successfully changed password' });
      else res.status(404).json({ error: 'User not found' });
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
      if (!user) return res.status(200).json({ message: "If mail is available, instructions will be sent." });

      const token = crypto.randomBytes(32).toString('hex');
      const expires = new Date(Date.now() + 60 * 60 * 1000);
      await UserService.savePasswordResetToken(user.id, token, expires);

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
      const roles = await UserService.getRoles();
      res.status(200).json(roles);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server error");
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
        username, password, full_name, email, date_of_birth,
        phone, status, avatar, image_key, avatar_key, roleId, storeId, scheduleId
      } = req.body;

      const user = await UserService.createEmployee({
        username, password, full_name, email, date_of_birth,
        phone, status,
        avatar: avatar_key ?? image_key ?? avatar ?? null,
        roleId, storeId, scheduleId
      });

      res.status(201).json({ message: 'Empleado creado exitosamente', userId: user.id });
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
      const user_id = req.params.id;
      const { schedule_id, store_id } = req.body;
      if (!user_id || !schedule_id || !store_id) {
        return res.status(400).json({ error: "Missing data for assignment" });
      }
      await UserService.assignUserToScheduleStore(user_id, schedule_id, store_id);
      res.status(200).json({ message: 'Asignación exitosa' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error en asignación de horario' });
    }
  },

  updateUserRole: async (req, res) => {
    try {
      const user_id = req.params.id;
      const { role_id } = req.body;
      const role = await db('role').where({ id: role_id }).first();
      if (!role || role.isAdmin) return res.status(400).json({ error: "Cannot assign admin roles" });
      await UserService.updateUserRole(user_id, role_id);
      res.status(200).json({ message: 'Rol actualizado' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error actualizando rol' });
    }
  }
};

module.exports = UserController;
