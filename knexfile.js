module.exports = {
    development: {
      client: "pg",
      connection: {
        host: "127.0.0.1",
        user: "postgres",
        password: "SuperGalaxy17",
        database: "proyecto_de_grado"
      },
      migrations: {
        tableName: 'knex_migrations',
        directory: "./src/migrations"
      },
      seeds: {
        directory: "./seeds"
      }
    }
  };
  