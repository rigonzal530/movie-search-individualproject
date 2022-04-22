// initialization taken from lab 10
/***********************
  Load Components!

  Express      - A Node.js Framework
  Body-Parser  - A tool to help use parse the data in a post request
  Pg-Promise   - A database tool to help use connect to our PostgreSQL database
***********************/
var express = require('express'); //Ensure our express framework has been added
var app = express();
var bodyParser = require('body-parser'); //Ensure our body-parser tool has been added
app.use(bodyParser.json());              // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

//Create Database Connection
var pgp = require('pg-promise')();

/**********************
  Database Connection information
  host: This defines the ip address of the server hosting our database.
		We'll be using `db` as this is the name of the postgres container in our
		docker-compose.yml file. Docker will translate this into the actual ip of the
		container for us (i.e. can't be access via the Internet).
  port: This defines what port we can expect to communicate to our database.  We'll use 5432 to talk with PostgreSQL
  database: This is the name of our specific database.  From our previous lab,
		we created the football_db database, which holds our football data tables
  user: This should be left as postgres, the default user account created when PostgreSQL was installed
  password: This the password for accessing the database. We set this in the
		docker-compose.yml for now, usually that'd be in a seperate file so you're not pushing your credentials to GitHub :).
**********************/
const dev_dbConfig = {
	host: 'db',
	port: 5432,
	database: process.env.POSTGRES_DB,
	user:  process.env.POSTGRES_USER,
	password: process.env.POSTGRES_PASSWORD
};

/** If we're running in production mode (on heroku), the we use DATABASE_URL
 * to connect to Heroku Postgres.
 */
const isProduction = process.env.NODE_ENV === 'production';
const dbConfig = isProduction ? process.env.DATABASE_URL : dev_dbConfig;

// Heroku Postgres patch for v10
// fixes: https://github.com/vitaly-t/pg-promise/issues/711
if (isProduction) {
    pgp.pg.defaults.ssl = {rejectUnauthorized: false};
}

const db = pgp(dbConfig);

// set the view engine to ejs
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/'));//This line is necessary for us to use relative paths and access our resources directory

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
            myTitle: "Search History Error",
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
    var insertMovie = `INSERT INTO movies(poster, title, release, rating, plot) VALUES('${poster}', '${title}', '${releaseDate}', ${rating}, '${plot}') ON CONFLICT (plot) DO NOTHING;`;

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

const server = app.listen(process.env.PORT || 3000, () => {
    console.log(`Express running → PORT ${server.address().port}`);
  });