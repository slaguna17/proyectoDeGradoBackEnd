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

   getUsersByRoleAndQuery: async (query) => {
        return db('user')
            .join('user_role', 'user.id', 'user_role.user_id')
            .join('role', 'user_role.role_id', 'role.id')
            .where('role.isAdmin', false)
            .andWhere('user.username', 'ilike', `%${query}%`)
            .distinct('user.id', 'user.username', 'user.full_name', 'user.email', 'user.avatar', 'user.created_at');
    },

    assignShiftStore: async (userId, shiftId, storeId) => {
        return db('user_shift_store').insert({
            user_id: userId,
            shift_id: shiftId,
            store_id: storeId,
            created_at: db.fn.now(),
            updated_at: db.fn.now()
        });
    }


}

module.exports = UserModel;