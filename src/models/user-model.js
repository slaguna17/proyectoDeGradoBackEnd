const db = require('../config/db')

class UserModel {
    async createUser(username, password, full_name, email, date_of_birth, phone, status, last_access, avatar){
        const [id] = await  db('user').insert({
            username: username,
            password: password,
            full_name: full_name,
            email:email,
            date_of_birth:date_of_birth,
            phone: phone,
            status: status, 
            last_access: last_access, 
            avatar: avatar
        }).returning('id');

        return id
    }
}

module.exports = new UserModel();