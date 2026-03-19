const BusinessLogicError = require('../errors/BusinessLogicError');
const usersService = require('../services/users.service');

async function loginPage(req, res, next) {
    res.render('pages/login', {
        pageTitle: "Login",
        error: null
    });
}

async function registerPage(req, res, next) {
    res.render('pages/register', {
        pageTitle: "Register",
        error: null
    });
}

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

async function login(req, res, next) {
    try {
        const { email, password } = req.body;
        const userId = await usersService.login(email, password);

        req.session.regenerate((err) => {
            if (err) {
                return next(err);
            }

            req.session.userId = userId;
            res.redirect('/movies');
        });
    }
    catch (err) {
        if (err instanceof BusinessLogicError) {
            return res.status(401).render('pages/login', {
                pageTitle: "Login",
                error: 'Invalid email or password'
            });
        }
        next(err);
    }
        
}

async function logout(req, res, next) {
    req.session.destroy((err) => {
        if (err) {
            return next(err);
        }

        res.clearCookie('movie_search_session', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
        });
        res.redirect('/');
    });
}

module.exports = {
    loginPage,
    registerPage,
    register,
    login,
    logout
};