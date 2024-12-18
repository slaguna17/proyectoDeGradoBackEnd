const userService = require('../services/user-service');

class UserController{
    async createUser(req, res){
        try {
            const id = await userService.createUser(req.body);
            res.status(201).json(id);
        } catch (error) {
            console.error(error);
        }
    }
}

module.exports = new UserController();