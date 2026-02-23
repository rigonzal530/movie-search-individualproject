const db = require('../db/connection');

async function findByEmail(email) {
    return db.oneOrNone('SELECT user_id, email, created_at, updated_at FROM users WHERE email = $1', [email]);
};

async function createUser(email, password) {
    return db.one('INSERT INTO users(email, password) VALUES($1, $2) RETURNING user_id, email, created_at', [email, password]);
};

module.exports = {
    findByEmail,
    createUser
};