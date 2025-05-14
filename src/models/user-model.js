const db = require('../config/db')

const UserModel = {
    getUsers: async () => {
        return db('user').select('*')
    },
    getUserById: async (id) => {
        return db('user').where({ id }).first(); // Consulta directa
    },

    createUser: async ({
    username,
    password,
    full_name,
    email,
    date_of_birth,
    phone,
    status,
    avatar
  }) => {
    const [user] = await db('user')
      .insert({
        username,
        password,
        full_name,
        email,
        date_of_birth,
        phone,
        status,
        // Aquí aseguramos que last_access nunca sea null
        last_access: db.fn.now(),
        avatar: avatar || null,
        created_at: db.fn.now(),
        updated_at: db.fn.now()
      })
      .returning(['id', 'username', 'full_name', 'email', 'date_of_birth', 'phone']);
    return user;
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