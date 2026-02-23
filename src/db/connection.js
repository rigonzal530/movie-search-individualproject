// creates database connection which is used in the data layer
// pg-promise automatically ensures only one connection is created and shared by anything that imports it
const pgp = require('pg-promise')();
const isProduction = process.env.NODE_ENV === 'production';
const dbConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: isProduction ? { rejectUnauthorized: false } : false
};

const db = pgp(dbConfig);

module.exports = db;