const usersService = require('../services/users.service');

async function register(req, res, next) {
    try {
        // extracts credentials for the account to be created, then attempts to register them
        const {email, password} = req.body;
        const registeredUser = await usersService.register(email, password);

        return res.status(201).json(registeredUser);
    }
    catch (err) {
        next(err);
    }
}