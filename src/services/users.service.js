const validator = require('validator');
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 12;

const usersData = require('../data/users.data');
const BusinessLogicError = require('../errors/BusinessLogicError');


async function register(email, password) {
    // checks that an email and password were provided
    if (!email || !password) {
        throw new BusinessLogicError('Email and password are required', 'INVALID_INPUT', 400);
    }

    // validates email and password requirements
    const normalizedEmail = email.trim().toLowerCase();
    if (!validator.isEmail(normalizedEmail)){
        throw new BusinessLogicError('Invalid email formatting', 'INVALID_EMAIL', 400);
    }
    if (password.length < 8) {
        throw new BusinessLogicError('Password must be at least 8 characters long', 'INVALID_PASSWORD', 400);
    }

    const userExists = await usersData.findByEmail(normalizedEmail);
    if (userExists) {
        throw new BusinessLogicError('User already exists', 'USER_ALREADY_EXISTS', 409);
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    return usersData.createUser(normalizedEmail, hashedPassword);
}

async function login(email, password) {
    if (!email || !password) {
        throw new BusinessLogicError('Email and password are required', 'MISSING_CREDENTIALS', 400);
    }

    // normalizes email before checking for a user in the database
    const normalizedEmail = email.trim().toLowerCase();
    const user = await usersData.findByEmail(normalizedEmail);
    if (!user) {
        throw new BusinessLogicError('Invalid email or password', 'INVALID_CREDENTIALS', 401);
    }

    const matchingPassword = await bcrypt.compare(password, user.password);
    if (!matchingPassword) {
        throw new BusinessLogicError('Invalid email or password', 'INVALID_CREDENTIALS', 401);
    }

    return user.user_id;
}

module.exports = {
    register,
    login
};