const UserModel = require('../models/user-model');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const UserService = {
    getUsers: async () => {
        const users = await UserModel.getUsers();
        return users;
    },

    getById: async (id) => {
      if (!id) {
        throw new Error('User ID is required');
      }
      const user = await UserModel.getById(id);
      if (!user) {
        throw new Error('User not found');
      }
      return user; // Devuelve el usuario al controlador
    },

    createUser: async (userData) => {
        const {username, password, full_name, email, date_of_birth, phone, status, last_access, avatar} = userData
        const hashedPassword = await bcrypt.hash(password,10);
        return UserModel.createUser(username, hashedPassword, full_name, email, date_of_birth, phone, status, last_access, avatar)
    },

    updateUser: async (id, updateBody) => {
        const {password} = updateBody
        const hashedPassword = await bcrypt.hash(password,10);
        updateBody.password = hashedPassword
    
        const user = await UserModel.updateUser(id, updateBody)
        if(!user){
            throw new Error("User not found")
        }
        return user; 
    },

    deleteUser: async (id) => {
        if (!id) {
            throw new Error('Wrong ID');
        }
        const user = await UserModel.deleteUser(id);
        if (!user) {
            throw new Error('User not found');
        }
        return user;
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
  };

module.exports = UserService;