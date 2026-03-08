const db = require('../db/connection');

async function getMovies(userId) {
    return db.any(
        `SELECT m.* FROM user_movies um
            INNER JOIN movies m ON um.movie_id = m.movie_id
            WHERE um.user_id = $1
            ORDER BY um.created_at DESC`,
        [userId]
    );
}

async function findByImdbId(imdbId) {
    return db.oneOrNone(
        `SELECT * FROM movies
            WHERE imdb_id = $1`,
        [imdbId]
    );
}

async function createMovie(userId, movieDetails) {
    // starts a transaction to attempt inserting a movie into both "movies" and "user_movies"
    return db.tx(async t => {
        const { imdbID, Title, Poster, Released, imdbRating, Plot } = movieDetails;
        // attempt inserting the movie, always returning the full movie row without modifying it if already existing
        const insertedMovie = await t.one(
            `INSERT INTO movies(imdb_id, title, poster, release, rating, plot) 
                VALUES($1, $2, $3, $4, $5, $6)
                ON CONFLICT (imdb_id) DO UPDATE
                SET imdb_id = movies.imdb_id
                RETURNING *`,
            [imdbID, Title, Poster, Released, imdbRating, Plot]
        );

        // attempts inserting to user_movies, returning null (or false as a boolean) if already existing
        const insertedUserMovie = await t.oneOrNone(
            `INSERT INTO user_movies(user_id, movie_id)
                VALUES($1, $2)
                ON CONFLICT (user_id, movie_id) DO NOTHING
                RETURNING user_id`,
            [userId, insertedMovie.movie_id]
        );

        // returns inserted movie details (as they exist in the movies table) and a boolean determining whether the movie was added to user_movies
        return {
            insertedMovie,
            alreadyExisted: !insertedUserMovie };
    });
}

async function deleteMovie(userId, movieId) {
    return db.tx(async t => {
        // always delete from user_movies (idempotent if condition is unsatisfied)
        await t.none(
            `DELETE FROM user_movies
                WHERE user_id = $1
                AND movie_id = $2`,
            [userId, movieId]
        );

        // if no users still have the movie saved, delete from the movies table too
        const movieDeletionResult = await t.result(
            `DELETE FROM movies m
                WHERE m.movie_id = $1
                AND NOT EXISTS (
                    SELECT 1 FROM user_movies um
                        WHERE um.movie_id = m.movie_id
                )`,
            [movieId]
        );

        // returns a boolean determining if the movie was deleted from the movies table as a result of user_movies deletion
        return movieDeletionResult.rowCount > 0;
    });
}

async function deleteAllMovies(userId) {
    return db.tx(async t=> {
        const deletedMovies = await t.manyOrNone(
            `DELETE FROM user_movies
                WHERE user_id = $1
                RETURNING movie_id`,
            [userId]
        );

        // no need to delete from movies table if user_movies wasn't affected
        if (deletedMovies.length === 0) return;

        // extracts all the movie IDs from deleted movies
        const movieIds = deletedMovies.map(row => row.movie_id);

        // deletes any movies that are no longer saved by any users after the current user_movies deletion
        await t.none(
            `DELETE FROM movies m
                WHERE m.movie_id IN ($1:csv)
                AND NOT EXISTS (
                    SELECT 1 FROM user_movies um
                        WHERE um.movie_id = m.movie_id
                )`,
            [movieIds]
        );
    });
}

module.exports = {
    getMovies,
    findByImdbId,
    createMovie,
    deleteMovie,
    deleteAllMovies
};