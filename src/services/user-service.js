const UserModel = require('../models/user-model');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const UserService = {
    getUsers: async () => {
        const users = await UserModel.getUsers();
        return users;
    },

    getUserById: async (id) => {
        return await UserModel.getUserById(id);
    },

   createUser: async (userData) => {
        const {
            username,
            password,
            full_name,
            email,
            date_of_birth,
            phone,
            status = 'ACTIVE',
            avatar,
            roleId
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

    updateUser: async (id, data) => {
        return await UserModel.updateUser(id, data);
    },

    changePassword: async (id, newPassword) => {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        return await UserModel.updatePassword(id, hashedPassword);
    },


    deleteUser: async (id) => {
        await UserModel.deleteUserRelations(id);
        return await UserModel.deleteUser(id);
    },
         

    login: async (email, password) => {
        const user = await UserModel.findByEmail(email);
        
        //Check User credetials
        if (!user){
            throw new Error('Invalid credentials');
        }
    
        const isPassword = await bcrypt.compare(password, user.password)
        if (!isPassword){
            throw new Error('Invalid credentials');
        }
        //Check token
        const token = jwt.sign({userId: user.id}, process.env.SECRET_KEY,{
            expiresIn: "5m"
        });

        return token;
    },  

    getRoles: async () => {
        const roles = await UserModel.getRoles();
        return roles;
    },

    getEmployeesByStore: async (storeId) => {
        return await UserModel.getEmployeesByStore(storeId);
    },

    createEmployee: async (data) => {
        const {
            username,
            password,
            full_name,
            email,
            date_of_birth,
            phone,
            status = 'ACTIVE',
            avatar,
            roleId,
            storeId,
            shiftId
        } = data;

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

        if (storeId && shiftId) {
            await UserModel.assignShiftStore(newUser.id, shiftId, storeId);
        }

        return newUser;
    },


    searchUsersByRole: async (query) => {
        return await UserModel.getUsersByRoleAndQuery(query);
    },


    assignUserToShiftStore: async (userId, shiftId, storeId) => {
        await UserModel.assignShiftStore(userId, shiftId, storeId);
    }


  };

module.exports = UserService;