const UserModel = require('../models/user-model');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require('../config/db');

const SECRET = process.env.SECRET_KEY || process.env.JWT_SECRET || 'dev-secret';

const UserService = {
  getUsers: async () => UserModel.getUsers(),
  getUserById: async (id) => UserModel.getUserById(id),

  createUser: async (userData) => {
    const {
      username, password, full_name, email,
      date_of_birth, phone, status = 'ACTIVE',
      avatar, roleId
    } = userData;

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await UserModel.createUser({
      username,
      password: hashedPassword,
      full_name,
      email,
      date_of_birth,
      phone,
      status,
      avatar
    });

    if (roleId) {
      await UserModel.createUserRole(newUser.id, roleId);
    }

    return newUser;
  },

  updateUser: async (id, data) => UserModel.updateUser(id, data),

  changePassword: async (id, newPassword) => {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    return UserModel.updatePassword(id, hashedPassword);
  },

  deleteUser: async (id) => {
    await UserModel.deleteUserRelations(id);
    return UserModel.deleteUser(id);
  },

  getRolesByUserId: async (userId) => {
    return db('role')
      .join('user_role', 'role.id', '=', 'user_role.role_id')
      .where('user_role.user_id', userId)
      .select('role.id', 'role.name', 'role.isAdmin');
  },

  getPermitsByUserId: async (userId) => {
    return db('permit')
      .join('role_permit', 'permit.id', '=', 'role_permit.permit_id')
      .join('role', 'role.id', '=', 'role_permit.role_id')
      .join('user_role', 'user_role.role_id', '=', 'role.id')
      .where('user_role.user_id', userId)
      .distinct('permit.id', 'permit.name', 'permit.description');
  },

  login: async (email, password) => {
    const user = await UserModel.findByEmail(email);
    if (!user) throw new Error('Credenciales inválidas');

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new Error('Credenciales inválidas');

    const roles = await db('role')
      .join('user_role', 'role.id', '=', 'user_role.role_id')
      .where('user_role.user_id', user.id)
      .select('role.id', 'role.name', 'role.isAdmin');

    const isAdmin = roles.some(r => r.isAdmin === true);

    const permits = await db('permit')
      .join('role_permit', 'permit.id', '=', 'role_permit.permit_id')
      .whereIn('role_permit.role_id', roles.map(r => r.id))
      .distinct('permit.id', 'permit.name', 'permit.description');

    const token = jwt.sign(
      { userId: user.id, isAdmin },
      SECRET,
      { expiresIn: "1d" }
    );

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        email: user.email,
        avatar: user.avatar ?? null,
      },
      roles,
      permits,
      isAdmin
    };
  },

  findByEmail: async (email) => UserModel.findByEmail(email),

  savePasswordResetToken: async (userId, token, expires) => UserModel.savePasswordResetToken(userId, token, expires),

  findByResetToken: async (token) => UserModel.findByResetToken(token),

  clearPasswordResetToken: async (userId) => UserModel.clearPasswordResetToken(userId),

  getRoles: async () => UserModel.getRoles(),

  getAllEmployees: async () => UserModel.getAllEmployees(),

  getEmployeesByStore: async (storeId) => UserModel.getEmployeesByStore(storeId),
  
};

module.exports = UserService;
