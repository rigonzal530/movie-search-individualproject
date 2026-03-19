// needed to create route handlers within express
const express = require('express');
const router = express.Router();

// custom controller that contains handler implementation functions
const moviesController = require('../controllers/movies.controller');
const auth = require('../middleware/authentication');

router.get('/', auth.requireAuth, moviesController.getUserMovies);            // displays all saved movies' info for a specific user

module.exports = router;