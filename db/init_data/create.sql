DROP TABLE IF EXISTS movies CASCADE;
CREATE TABLE IF NOT EXISTS movies(
  movie_id SERIAL PRIMARY KEY,
  poster VARCHAR(2048) NOT NULL,    /* URL of the movie's poster    */
  title VARCHAR(200) NOT NULL,      /* Title of the movie           */
  release DATE NOT NULL,            /* Release date of the movie    */
  rating NUMERIC NOT NULL,          /* IMDB rating of the movie     */
  plot TEXT NOT NULL                /* Plot of the movie            */
);