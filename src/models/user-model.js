const db = require('../config/db')

const UserModel = {
    getUsers: async () => {
        return db('user').select('*')
    },
    getUserById: async (id) => {
        return db('user').where({ id }).first(); // Consulta directa
    },

    createUser: async (username, password, full_name, email, date_of_birth, phone, status, last_access, avatar) => {
        const [newUser] = await db('user').insert({
            username: username,
            password: password,
            full_name: full_name,
            email:email,
            date_of_birth:date_of_birth,
            phone: phone,
            status: status, 
            last_access: last_access, 
            avatar: avatar
        }).returning('*');

        return newUser
    },

    createUserRole: async (userId, roleId) => {
        return db('user_role').insert({
            user_id: userId,
            role_id: roleId,
        });
    },

    updateUser: async(id,updateBody) => {
        const updatedUser = await db('user').where({id}).update(updateBody).returning('*')
        return updatedUser[0]
    },
    
    deleteUser: async(id) => {
        return await db('user').where({id}).del();
    },

    //login
    findByEmail: async (email) => {
        return await db('user').where({email}).first();
    },

    getRoles: async () => {
        return db('role').select('*')
    },
}

module.exports = UserModel;