const { getUsers } = require('../models/user-model');
const UserService = require('../services/user-service');

const UserController = {
    getUsers: async (req,res) => {
        try {
            const users = await UserService.getUsers()
            res.status(200).json(users);
        } catch (error) {
            console.error(error.message);
            res.status(500).send("aaa error")
        }
    },
    getUserById: async (req, res) => {
      try {
        const user = await UserService.getById(req.params.id);
        res.status(200).json(user); // Devuelve la respuesta
      } catch (error) {
        console.error(error.message);
        res.status(404).send("User not found")
      }
    },

    createUser: async(req,res) => {
        try {
            const newUser = await UserService.createUser(req.body);
            res.status(201).json(newUser)
        } catch (error) {
            console.error(error.message);
            res.status(500).send("Server error")
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
    }
    

  };

module.exports = UserController;