require('dotenv').config();

const parseBoolean = (value) => String(value).toLowerCase() === 'true';

const sharedConfig = {
  client: 'pg',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'tukiosco',
    port: Number(process.env.DB_PORT || 5432),
    ...(parseBoolean(process.env.DB_SSL)
      ? { ssl: { rejectUnauthorized: false } }
      : {})
  },
  migrations: {
    tableName: 'knex_migrations',
    directory: './src/migrations'
  },
  seeds: {
    directory: './src/seeds'
  },
  pool: {
    min: Number(process.env.DB_POOL_MIN || 2),
    max: Number(process.env.DB_POOL_MAX || 10)
  }
};

module.exports = {
  development: sharedConfig,
  test: {
    ...sharedConfig,
    connection: {
      ...sharedConfig.connection,
      database: process.env.DB_TEST_NAME || `${process.env.DB_NAME || 'tukiosco'}_test`
    }
  },
  production: {
    ...sharedConfig,
    pool: {
      min: Number(process.env.DB_POOL_MIN || 2),
      max: Number(process.env.DB_POOL_MAX || 20)
    }
  }
};
