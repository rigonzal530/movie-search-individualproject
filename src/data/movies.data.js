const db = require('../db/connection');

async function getMovies(userId) {
    return db.any(
        `SELECT m.* FROM user_movies um
            INNER JOIN movies m ON um.movie_id = m.movie_id
            WHERE um.user_id = $1
            ORDER BY um.created_at DESC`,
        [userId]
    );
};

async function createMovie(userId, movieDetails) {
    // starts a transaction to attempt inserting a movie into both "movies" and "user_movies"
    return db.tx(async t => {
        const { imdbId, title, poster, release, rating, plot } = movieDetails;
        // attempt inserting the movie, doing nothing if it already exists
        const insertedMovie = await t.oneOrNone(
            `INSERT INTO movies(imdb_id, title, poster, release, rating, plot) 
                VALUES($1, $2, $3, $4, $5, $6)
                ON CONFLICT (imdb_id) DO NOTHING
                RETURNING movie_id`,
            [imdbId, title, poster, release, rating, plot]
        );

        // retrieves the movie's ID from either the previous insert statement (if it didn't exist), or the existing movie's row
        let movieId;
        if (insertedMovie) {
            movieId = insertedMovie.movie_id;
        }
        else {
            const existingMovie = await t.one(
                `SELECT movie_id FROM movies WHERE imdb_id = $1`,
                [imdbId]
            );
            movieId = existingMovie.movie_id;
        }

        // attempts inserting to user_movies, returning null if already existing
        const insertedUserMovie = await t.oneOrNone(
            `INSERT INTO user_movies(user_id, movie_id)
                VALUES($1, $2)
                ON CONFLICT (user_id, movie_id) DO NOTHING
                RETURNING user_id`,
            [userId, movieId]
        );

        // returns movieId and a boolean determining whether the movie was added to user_movies
        return {
            movieId,
            wasInserted: !!insertedUserMovie };
    });
};

async function deleteMovie(userId, movieId) {

};

async function deleteAllMovies(userId) {

};

module.exports = {
    getMovies,
    createMovie,
    deleteMovie,
    deleteAllMovies
};