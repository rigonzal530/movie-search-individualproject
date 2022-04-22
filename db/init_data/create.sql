DROP TABLE IF EXISTS movies CASCADE;
CREATE TABLE IF NOT EXISTS movies(
  movie_id SERIAL PRIMARY KEY,
  poster VARCHAR(2048) NOT NULL,    /* URL of the movie's poster    */
  title VARCHAR(200) NOT NULL,      /* Title of the movie           */
  release DATE NOT NULL,            /* Release date of the movie    */
  rating NUMERIC NOT NULL,          /* IMDB rating of the movie     */
  plot TEXT UNIQUE NOT NULL                /* Plot of the movie            */
);

INSERT INTO movies(poster, title, release, rating, plot) VALUES('https://m.media-amazon.com/images/M/MV5BOGE4NzU1YTAtNzA3Mi00ZTA2LTg2YmYtMDJmMThiMjlkYjg2XkEyXkFqcGdeQXVyNTgzMDMzMTg@._V1_SX300.jpg)', 'Thor', '06 May 2011', 7.0 ,'The powerful but arrogant god Thor is cast out of Asgard to live amongst humans in Midgard (Earth), where he soon becomes one of their finest defenders.') ON CONFLICT (plot) DO NOTHING;