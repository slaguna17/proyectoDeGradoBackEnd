const db = require('../config/db')

const UserModel = {

    getUsers: async () => {
        return db('user').select('*')
    },

    getUserById: async (id) => {
        const user = await db('user').where({ id }).first();

        if (!user) return null;

        const roles = await db('user_role')
            .join('role', 'user_role.role_id', 'role.id')
            .where('user_role.user_id', id)
            .select('role.id', 'role.name', 'role.isAdmin');

        const assignments = await db('user_shift_store')
            .join('store', 'user_shift_store.store_id', 'store.id')
            .join('shift', 'user_shift_store.shift_id', 'shift.id')
            .where('user_shift_store.user_id', id)
            .select(
                'store.id as storeId',
                'store.name as storeName',
                'shift.id as shiftId',
                'shift.name as shiftName'
            );

        const mappedAssignments = assignments.map(a => ({
            store: { id: a.storeId, name: a.storeName },
            shift: { id: a.shiftId, name: a.shiftName }
        }));

        return {
            ...user,
            roles,
            assignments: mappedAssignments
        };
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

    updateUser: async (id, data) => {
        return await db('user')
            .where({ id })
            .update({
            ...data,
            updated_at: db.fn.now()
            });
    },

    updatePassword: async (id, hashedPassword) => {
        return await db('user')
            .where({ id })
            .update({
                password: hashedPassword,
                updated_at: db.fn.now()
            });
    },

    
    deleteUserRelations: async (id) => {
        await db('user_role').where({ user_id: id }).del();
        await db('user_shift_store').where({ user_id: id }).del();
    },

    deleteUser: async (id) => {
        return await db('user').where({ id }).del();
    },

    //login
    findByEmail: async (email) => {
        return await db('user').where({email}).first();
    },

    getRoles: async () => {
        return db('role').select('*')
    },

    getEmployeesByStore: async (storeId) => {
        return await db('user_shift_store')
            .join('user', 'user_shift_store.user_id', 'user.id')
            .join('shift', 'user_shift_store.shift_id', 'shift.id')
            .join('user_role', 'user.id', 'user_role.user_id')
            .join('role', 'user_role.role_id', 'role.id')
            .where('user_shift_store.store_id', storeId)
            .andWhere('role.isAdmin', false)
            .select(
            'user.id as user_id',
            'user.username',
            'user.full_name',
            'user.email',
            'shift.id as shift_id',
            'shift.name as shift_name'
            );
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