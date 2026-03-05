const moviesData = require('../data/movies.data');
const BusinessLogicError = require('../errors/BusinessLogicError');
const OMDB_BASE_URL = `https://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}`;

async function getUserMovies(userId) {
    return moviesData.getMovies(userId);
}

async function saveMovie(userId, movieDetails) {
    return moviesData.createMovie(userId, movieDetails);
}

async function deleteMovie(userId, movieId) {
    return moviesData.deleteMovie(userId, movieId);
}

async function deleteAllMovies(userId) {
    return moviesData.deleteAllMovies(userId);
}

async function searchMovies(userSearch, resultsPage) {
    const url = `${OMDB_BASE_URL}&s=${encodeURIComponent(userSearch)}&page=${resultsPage}`;
    const data = await fetchFromOMDB(url);

    return {
        results: data.Search,
        totalResults: parseInt(data.totalResults, 10)
    };
}

async function searchMovieDetails(imdbId) {
    const cachedMovie = await moviesData.findByImdbId(imdbId);
    if (cachedMovie) {
        return {
            imdbID: cachedMovie.imdb_id,
            Title: cachedMovie.title,
            Poster: cachedMovie.poster,
            Released: cachedMovie.release,
            imdbRating: cachedMovie.rating,
            Plot: cachedMovie.plot
        };
    }

    const url = `${OMDB_BASE_URL}&i=${encodeURIComponent(imdbId)}`;
    const data = await fetchFromOMDB(url);

    return data;
}

async function fetchFromOMDB(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            // if fetching from OMDB fails for any reason, throw an error
            throw new BusinessLogicError("OMDb service unavailable", 'EXTERNAL_API_ERROR', 502);
        }

        const data = await response.json();
        if (data.Response === 'False') {
            // when given incorrect input, the OMDb API returns Response: "False" and Error: "Movie not found!"
            throw new BusinessLogicError(data.Error || 'Movie not found', 'MOVIE_NOT_FOUND', 404);
        }

        return data;
    }
    catch (err) {
        // ensures errors from the try block are passed along to the error handler
        if (err instanceof BusinessLogicError) {
            throw err;
        }
        // otherwise something unaccounted for went wrong when fetching data from OMDb
        throw new BusinessLogicError('Failed to fetch movie data', 'EXTERNAL_API_ERROR', 502);
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