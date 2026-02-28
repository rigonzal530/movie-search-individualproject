// needed to create route handlers within express
const express = require('express');
const router = express.Router();

// custom controller that contains handler implementation functions
const moviesController = require('../controllers/movies.controller');
const auth = require('../middleware/authentication');

router.get('/', auth.requireAuth, moviesController.getUserMovies);            // displays all saved movies' info for a specific user
router.post('/', auth.requireAuth, moviesController.saveMovie);               // saves a new movie to the user_movies db, and movies_db if it doesn't exist there
router.delete('/', auth.requireAuth, moviesController.deleteAllMovies);       // deletes all movies associated with a user from user_movies, and removes it from the movies table if no users have it in their saved history
router.delete('/:movieId', auth.requireAuth, moviesController.deleteMovie);   // deletes a specific movie from the user_movies table, and removes it from the movies table if no usres have it in their saved history

router.get('/search', moviesController.searchMovie);        // retrieves information on a movie from the OMDb API (may be removed from this router if expanded upon)

module.exports = router;