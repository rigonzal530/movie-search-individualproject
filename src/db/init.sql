-- DROP TABLE IF EXISTS movies CASCADE;
CREATE TABLE IF NOT EXISTS movies(
  movie_id SERIAL PRIMARY KEY,
  imdb_id VARCHAR(15) UNIQUE NOT NULL,      /* IMDB ID of the movie         */
  title VARCHAR(200) NOT NULL,              /* Title of the movie           */
  poster VARCHAR(2048) NOT NULL,            /* URL of the movie's poster    */
  release DATE NOT NULL,                    /* Release date of the movie    */
  rating NUMERIC(3, 1) NOT NULL,            /* IMDB rating of the movie     */
  plot TEXT NOT NULL                        /* Plot of the movie            */
);

CREATE TABLE IF NOT EXISTS users(
  user_id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS user_movies(
  user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
  movie_id INT REFERENCES movies(movie_id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY (user_id, movie_id)
);

CREATE INDEX IF NOT EXISTS idx_user_movies_user_id ON user_movies(user_id);