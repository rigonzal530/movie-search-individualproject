// needed to create route handlers within express
const express = require('express');
const router = express.Router();

// custom controller that contains handler implementation functions
const usersController = require('../controllers/users.controller');
const auth = require('../middleware/authentication');

router.get('/login', auth.redirectIfAuth, usersController.loginPage);                    // renders the login page
router.get('/register', auth.redirectIfAuth, usersController.registerPage);              // renders the registration page

module.exports = router;