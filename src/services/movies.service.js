const moviesData = require('../data/movies.data');
const BusinessLogicError = require('../errors/BusinessLogicError');

async function getUserMovies(userId) {
    return moviesData.getMovies(userId);
};

async function saveMovie(userId, movieDetails) {
    return moviesData.createMovie(userId, movieDetails);
};

async function deleteMovie(userId, movieId) {
    return moviesData.deleteMovie(userId, movieId);
};

async function deleteAllMovies(userId) {
    return moviesData.deleteAllMovies(userId);
};

async function searchMovie(userSearch) {
    let omdbApiCall = `https://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&`;

    // IMDB ID's follow the format of "tt" followed by at least 7 digits https://developer.imdb.com/documentation/key-concepts
    const imdbIDRegex = /^tt\d{7,}$/;

    // enters if "userSearch" was an IMDB id. appends "userSearch" to "url" with the ID format, otherwise uses Title format
    if (userSearch.match(imdbIDRegex)) {
        omdbApiCall += `i=${userSearch}`;
    }
    else {
        omdbApiCall += `t=${encodeURIComponent(userSearch)}`;
    }

    try {
        const response = await fetch(omdbApiCall);
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
};

module.exports = {
    getUserMovies,
    saveMovie,
    deleteMovie,
    deleteAllMovies,
    searchMovie
};