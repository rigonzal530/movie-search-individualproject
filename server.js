/***********************
  Load Components!

  Express      - A Node.js Framework
  Body-Parser  - A tool to help use parse the data in a post request
  Pg-Promise   - A database tool to help use connect to our PostgreSQL database
***********************/
const express = require('express'); //Ensure our express framework has been added
const app = express();
const bodyParser = require('body-parser'); //Ensure our body-parser tool has been added
app.use(bodyParser.json());              // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
require('dotenv').config(); // ensures environment variables are available before continuing

//Create Database Connection
const pgp = require('pg-promise')();
const isProduction = process.env.NODE_ENV === 'production';
const dbConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: isProduction ? { rejectUnauthorized: false } : false
};
const db = pgp(dbConfig);

// set the view engine to ejs
const path = require('path');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));
app.use(express.static(path.join(__dirname, 'src')));//This line is necessary for us to use relative paths and access our resources directory

// renders the home page
app.get('/', (req, res) =>
{
    res.render('pages/home', { myTitle: "Home" });
});

// renders the search history page, which displays all saved movies data in a table
app.get('/searches', (req, res) =>
{
    var getMovies = "SELECT * FROM movies;";
    db.any(getMovies)
    .then((data) =>
    {
        res.render('pages/searches',
        {
            myTitle: "Search History",
            data: data
        });
    })
    .catch((err) =>
    {
        console.log("error: ", err);
        res.render('pages/searches',
        {
            myTitle: "Search History",
            data: null
        });
    })
});

// adds the searched movie's data to the database
app.post('/add', (req, res) =>
{
    // sets all the variables to the variables passed in from the AJAX call's json
    const poster = req.body.poster;
    const title = req.body.title;
    const releaseDate = req.body.release;
    const rating = req.body.rating;
    const plot = req.body.plot;
    // this query prevents duplicates from being added, but "data" has no way to distinguish whether ON CONFLICT was used or not
    // consequently, the feedback for attempting to add a duplicate is dealt with in script.js
    var insertMovie = `INSERT INTO movies(poster, title, release, rating, plot) VALUES('${poster}', '${title}', '${releaseDate}', ${rating}, '${plot}') ON CONFLICT (title) DO NOTHING;`;

    // writes the "insertMovie" query to the database
    db.any(insertMovie)
    .then((data) =>
    {
        res.status(201).send();
    })
    .catch((err) => 
    {
        res.status(404).send();
        console.log("error: ", err);
    });
})

// deletes all records in the movies table
app.post('/delete', (req, res) =>
{
    // query to remove all rows from the movies table
    var deleteAll = "DELETE FROM movies;";

    // writes the "deleteAll" query to the database
    db.any(deleteAll)
    .then((data) =>
    {
        res.render('pages/searches',
        {
            myTitle: "Search History",
            data: data
        });
    })
    .catch((err) => 
    {
        res.render('pages/searches',
        {
            myTitle: "Search History",
            data: null
        });
        console.log("error: ", err);
    });
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`${PORT} is the magic port`);
});

module.exports = app;