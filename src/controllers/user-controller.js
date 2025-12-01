const UserService = require('../services/user-service');
const crypto = require('crypto');
const { attachImageUrl, attachImageUrlMany, replaceImageKey } = require('../utils/image-helpers');
const db = require('../config/db');
const { buildMenu } = require('../utils/menu-builder');

const UserController = {
  getUsers: async (req, res) => {
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

  getMe: async (req, res) => {
    try {
      const signed = req.query.signed === 'true';
      const me = await UserService.getUserById(req.user.userId || req.user.id);
      const withUrl = await attachImageUrl(me, 'avatar', { signed });

      const roles = await UserService.getRolesByUserId(req.user.userId || req.user.id);
      const isAdmin = roles.some(r => r.isAdmin === true) || !!req.user.isAdmin;
      const permits = await UserService.getPermitsByUserId(req.user.userId || req.user.id);

      const menu = buildMenu({ isAdmin, permits });
      res.status(200).json({ user: withUrl, roles, permits, isAdmin, menu });
    } catch (error) {
      console.error(error.message);
      res.status(500).send({ message: `Server error: ${error.message}` });
    }
  },

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
        avatar: avatar_key ?? image_key ?? avatar ?? null,
        roleId
      });

      const out = await attachImageUrl(user, 'avatar', { signed: false });
      res.status(201).json({
        message: 'User created successfully',
        userId: user.id,
        username: user.username,
        user: out
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error creating user' });
    }
  },

  updateUser: async (req, res) => {
    const { id } = req.params;
    const updatableFields = ['full_name','email','phone','date_of_birth','status'];
    const updateData = {};
    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) updateData[field] = req.body[field];
    });

    try {
      const prev = await UserService.getUserById(id);
      if (!prev) return res.status(404).json({ message: 'User not found' });

      const { avatar, image_key, avatar_key, removeImage = false } = req.body;
      let nextAvatar = prev.avatar ?? null;

      if (removeImage) {
        if (prev.avatar) await replaceImageKey(prev.avatar, null);
        nextAvatar = null;
      } else if (avatar != null || image_key != null || avatar_key != null) {
        nextAvatar = await replaceImageKey(prev.avatar, avatar_key ?? image_key ?? avatar);
      }
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

  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const result = await UserService.login(email, password);
      const signed = req.query.signed === 'true';
      result.user = await attachImageUrl(result.user, 'avatar', { signed });

      const menu = buildMenu({ isAdmin: result.isAdmin, permits: result.permits });
      return res.status(200).json({ ...result, menu });
    } catch (error) {
      console.error(error.message);

      if (error.code === 'INVALID_CREDENTIALS') {
        return res.status(error.statusCode || 401).json({
          message: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS',
        });
      }

      return res.status(500).json({
        message: 'Internal server error',
        code: 'INTERNAL_SERVER_ERROR',
      });
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
      res.status(500).json({ error: "Error resetting password" });
    }
  },

  getRoles: async (_req,res) => {
    try {
      const roles = await UserService.getRoles();
      res.status(200).json(roles);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server error");
    }
  },

  getAllEmployees: async (_req, res) => {
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
};

module.exports = UserController;
