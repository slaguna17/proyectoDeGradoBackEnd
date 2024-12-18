const userModel = require('../models/user-model');

class userService{
    createUser(userData){
        const {username, password, full_name, email, date_of_birth, phone, status, last_access, avatar} = userData
        return userModel.createUser(username, password, full_name, email, date_of_birth, phone, status, last_access, avatar)
    }
}

module.exports = new userService()