// needed to create route handlers within express
const express = require('express');
const router = express.Router();

// custom controller that contains handler implementation functions
const usersController = require('../controllers/users.controller');

router.get('/login', usersController.loginPage);            // renders the login page
router.get('/register', usersController.registerPage);      // renders the registration page
router.post('/users/register', usersController.register);   // registers new users
router.post('/users/login', usersController.login);         // logs in existing users

module.exports = router;