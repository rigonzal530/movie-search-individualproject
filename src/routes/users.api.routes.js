// needed to create route handlers within express
const express = require('express');
const router = express.Router();

// custom controller that contains handler implementation functions
const usersController = require('../controllers/users.controller');
const auth = require('../middleware/authentication');

router.post('/register', auth.redirectIfAuth, usersController.register);           // registers new users
router.post('/login', auth.redirectIfAuth, usersController.login);                 // logs in existing users
router.post('/logout', auth.requireAuth, usersController.logout);  // logs out a user of their session

module.exports = router;