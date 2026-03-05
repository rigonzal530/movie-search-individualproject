// needed to create route handlers within express
const express = require('express');
const router = express.Router();

// custom controller that contains handler implementation functions
const moviesController = require('../controllers/movies.controller');
const auth = require('../middleware/authentication');

router.post('/', auth.requireAuth, moviesController.saveMovie);               // saves a new movie to the user_movies db, and movies_db if it doesn't exist there
router.delete('/', auth.requireAuth, moviesController.deleteAllMovies);       // deletes all movies associated with a user from user_movies, and removes it from the movies table if no users have it in their saved history
router.delete('/:movieId', auth.requireAuth, moviesController.deleteMovie);   // deletes a specific movie from the user_movies table, and removes it from the movies table if no usres have it in their saved history

router.get('/search', moviesController.searchMovies);           // retrieves a list of movies one page at a time from the OMDb API
router.get('/:movieId', moviesController.searchMovieDetails);   // retrieves a specific movie's details from the movies table OR the OMDb API using its IMDb ID

module.exports = router;