const BusinessLogicError = require('../errors/BusinessLogicError');
const moviesService = require('../services/movies.service');

async function getUserMovies(req, res, next) {
    try {
        const userId = req.session.userId;
        const userMovies = await moviesService.getUserMovies(userId);

        res.render('pages/searches', {
            pageTitle: "Saved Movies",
            data: userMovies
        });
    }
    catch (err) {
        next(err);
    }
}

async function saveMovie(req, res, next) {
    try {
        const userId = req.session.userId;
        const imdbId = req.body.imdbId; // contains the IMDb ID from the AJAX call in script.js
        const imdbIDRegex = /^tt\d{7,}$/; // IMDB ID's follow the format of "tt" followed by at least 7 digits https://developer.imdb.com/documentation/key-concepts
        if (!imdbIDRegex.test(imdbId)) {
            throw new BusinessLogicError('Invalid IMDb ID', 'INVALID_INPUT', 400);
        }
        
        const movieDetails = await moviesService.searchMovieDetails(imdbId); // retrieves the movie details from the OMDb API (or the movies table cache) using the provided IMDb ID
        const savedMovie = await moviesService.saveMovie(userId, movieDetails);

        return res.status(savedMovie.alreadyExisted ? 200 : 201).json(savedMovie);
    }
    catch (err) {
        next(err);
    }
}

async function deleteMovie(req, res, next) {
    try {
        const userId = req.session.userId;
        const movieId = req.params.movieId;

        await moviesService.deleteMovie(userId, movieId);

        return res.status(204).end();
    }
    catch (err) {
        next(err);
    }
}

async function deleteAllMovies(req, res, next) {
    try {
        const userId = req.session.userId;

        await moviesService.deleteAllMovies(userId);

        return res.status(204).end();
    }
    catch (err) {
        next(err);
    }
}

async function searchMovies(req, res, next) {
    try {
        const userSearch = req.query.search?.trim();
        const resultsPage = Math.max(1, parseInt(req.query.page, 10) || 1); // default to page 1 if not provided or invalid
        if (!userSearch) {
            throw new BusinessLogicError('Search term required', 'INVALID_INPUT', 400);
        }

        const searchResults = await moviesService.searchMovies(userSearch, resultsPage);

        return res.json(searchResults);
    }
    catch (err) {
        next(err);
    }
}

async function searchMovieDetails(req, res, next) {
    try {
        // IMDB ID's follow the format of "tt" followed by at least 7 digits https://developer.imdb.com/documentation/key-concepts
        const imdbIDRegex = /^tt\d{7,}$/;
        const imdbId = req.params.movieId;
        if (!imdbIDRegex.test(imdbId)) {
            throw new BusinessLogicError('Invalid IMDb ID', 'INVALID_INPUT', 400);
        }
        
        const movieDetails = await moviesService.searchMovieDetails(imdbId);

        return res.json(movieDetails);
    }
    catch (err) {
        next(err);
    }
}

module.exports = {
    getUserMovies,
    saveMovie,
    deleteMovie,
    deleteAllMovies,
    searchMovies,
    searchMovieDetails
};