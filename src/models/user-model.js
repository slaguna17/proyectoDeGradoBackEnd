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

        const assignments = await db('user_schedule_store')
            .join('store', 'user_schedule_store.store_id', 'store.id')
            .join('schedule', 'user_schedule_store.schedule_id', 'schedule.id')
            .where('user_schedule_store.user_id', id)
            .select(
                'store.id as storeId',
                'store.name as storeName',
                'schedule.id as scheduleId',
                'schedule.name as scheduleName'
            );

        const mappedAssignments = assignments.map(a => ({
            store: { id: a.storeId, name: a.storeName },
            schedule: { id: a.scheduleId, name: a.scheduleName }
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

    savePasswordResetToken: async (userId, token, expires) => {
        return await db('user')
            .where({ id: userId })
            .update({ reset_token: token, reset_expires: expires });
    },

    findByResetToken: async (token) => {
        return await db('user').where({ reset_token: token }).first();
    },

    clearPasswordResetToken: async (userId) => {
        return await db('user')
            .where({ id: userId })
            .update({ reset_token: null, reset_expires: null });
    },
    
    deleteUserRelations: async (id) => {
        await db('user_role').where({ user_id: id }).del();
        await db('user_schedule_store').where({ user_id: id }).del();
    },

    deleteUser: async (id) => {
        return await db('user').where({ id }).del();
    },

    findByEmail: async (email) => {
        return await db('user').where({email}).first();
    },

    getRoles: async () => {
        return db('role').select('*')
    },

    getAllEmployees: async () => {
        return db('user')
            .join('user_role', 'user.id', 'user_role.user_id')
            .join('role', 'user_role.role_id', 'role.id')
            .leftJoin('user_schedule_store', 'user.id', 'user_schedule_store.user_id')
            .leftJoin('store', 'user_schedule_store.store_id', 'store.id')
            .leftJoin('schedule', 'user_schedule_store.schedule_id', 'schedule.id')
            .where('role.isAdmin', false)
            .select(
                'user.id',
                'user.username',
                'user.full_name',
                'user.email',
                'user.avatar',
                'store.id as store_id',
                'store.name as store_name',
                'schedule.id as schedule_id',
                'schedule.name as schedule_name',
                db.raw('array_agg(role.name) as roles')
            )
            .groupBy('user.id', 'store.id', 'schedule.id');
    },

    getEmployeesByStore: async (storeId) => {
        return await db('user_schedule_store')
            .join('user', 'user_schedule_store.user_id', 'user.id')
            .join('schedule', 'user_schedule_store.schedule_id', 'schedule.id')
            .join('store', 'user_schedule_store.store_id', 'store.id')
            .join('user_role', 'user.id', 'user_role.user_id')
            .join('role', 'user_role.role_id', 'role.id')
            .where('user_schedule_store.store_id', storeId)
            .andWhere('role.isAdmin', false)
            .select(
                'user.id',
                'user.username',
                'user.full_name',
                'user.email',
                'user.avatar',
                'store.id as store_id',
                'store.name as store_name',
                'schedule.id as schedule_id',
                'schedule.name as schedule_name',
                db.raw('array_agg(role.name) as roles')
            )
            .groupBy('user.id', 'store.id', 'schedule.id');
    },

   getUsersByRoleAndQuery: async (query) => {
        return db('user')
            .join('user_role', 'user.id', 'user_role.user_id')
            .join('role', 'user_role.role_id', 'role.id')
            .where('role.isAdmin', false)
            .andWhere('user.username', 'ilike', `%${query}%`)
            .distinct('user.id', 'user.username', 'user.full_name', 'user.email', 'user.avatar', 'user.created_at');
    },

    assignScheduleStore: async (userId, scheduleId, storeId) => {
        await db('user_schedule_store').where({ user_id: userId }).del();
        return db('user_schedule_store').insert({
            user_id: userId,
            schedule_id: scheduleId,
            store_id: storeId,
            created_at: db.fn.now(),
            updated_at: db.fn.now()
        });
    },

    updateUserRole: async (userId, newRoleId) => {
        await db('user_role').where({ user_id: userId }).del();
        return db('user_role').insert({ user_id: userId, role_id: newRoleId });
    }

}

module.exports = UserModel;