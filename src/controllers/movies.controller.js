const moviesService = require('../services/movies.service');

async function getUserMovies(req, res, next) {
    try {
        const userId = req.user.id;
        const userMovies = await moviesService.getUserMovies(userId);

        res.render('pages/searches', {
            myTitle: "Saved Movies",
            data: userMovies
        });
    }
    catch (err) {
        next(err);
    }
};

async function saveMovie(req, res, next) {
    try {
        const userId = req.user.id;
        const movieDetails = req.body; // contains a json containing poster, title, releaseDate, rating, and plot from the AJAX call in script.js

        const savedMovie = await moviesService.saveMovie(userId, movieDetails);
        
        if (savedMovie.alreadyExisted) {
            return res.status(200).json(savedMovie);
        }

        res.status(201).json(savedMovie);
    }
    catch (err) {
        next(err);
    }
};

async function deleteMovie(req, res, next) {
    try {
        const userId = req.user.id;
        const movieId = req.params.movieId;

        await moviesService.deleteMovie(userId, movieId);

        res.status(204).end();
    }
    catch (err) {
        next(err);
    }
};

async function deleteAllMovies(req, res, next) {
    try {
        const userId = req.user.id;

        await moviesService.deleteAllMovies(userId);

        res.status(204).end();
    }
    catch (err) {
        next(err);
    }
};

async function searchMovie(req, res, next) {
    try {
        const userSearch = req.query.search?.trim();
        if (!userSearch) {
            return res.status(400).json({ error: 'Search term required' });
        }

        const movieData = await moviesService.searchMovie(userSearch);

        res.json(movieData);
    }
    catch (err) {
        next(err);
    }
};

module.exports = {
    getUserMovies,
    saveMovie,
    deleteMovie,
    deleteAllMovies,
    searchMovie
};