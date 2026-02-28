// needed to create route handlers within express
const express = require('express');
const router = express.Router();

// custom controller that contains handler implementation functions
const usersController = require('../controllers/users.controller');
const auth = require('../middleware/authentication');

router.get('/login', auth.redirectIfAuth, usersController.loginPage);                    // renders the login page
router.get('/register', auth.redirectIfAuth, usersController.registerPage);              // renders the registration page
router.post('/users/register', auth.redirectIfAuth, usersController.register);           // registers new users
router.post('/users/login', auth.redirectIfAuth, usersController.login);                 // logs in existing users
router.post('/users/logout', auth.requireAuth, usersController.logout);  // logs out a user of their session

module.exports = router;