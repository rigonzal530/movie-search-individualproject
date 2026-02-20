// needed to create route handlers within express
const express = require('express');
const router = express.Router();

// custom controller that contains handler implementation functions
const usersController = require('../controllers/users.controller');

router.post('/register', usersController.register);     // registers new users
router.post('/login', usersController.login);           // logs in existing users

module.exports = router;