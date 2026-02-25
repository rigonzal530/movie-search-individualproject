const usersData = require('../data/movies.data');
const BusinessLogicError = require('../errors/BusinessLogicError');

// // renders the search history page, which displays all saved movies data in a table
// app.get('/', (req, res) =>
// {
//     var getMovies = "SELECT * FROM movies;";
//     db.any(getMovies)
//     .then((data) =>
//     {
//         res.render('pages/searches',
//         {
//             myTitle: "Search History",
//             data: data
//         });
//     })
//     .catch((err) =>
//     {
//         console.log("error: ", err);
//         res.render('pages/searches',
//         {
//             myTitle: "Search History",
//             data: null
//         });
//     })
// });

// // adds the searched movie's data to the database
// app.post('/save', (req, res) =>
// {
//     // sets all the variables to the variables passed in from the AJAX call's json
//     const poster = req.body.poster;
//     const title = req.body.title;
//     const releaseDate = req.body.release;
//     const rating = req.body.rating;
//     const plot = req.body.plot;
//     // this query prevents duplicates from being added, but "data" has no way to distinguish whether ON CONFLICT was used or not
//     // consequently, the feedback for attempting to add a duplicate is dealt with in script.js
//     var insertMovie = `INSERT INTO movies(poster, title, release, rating, plot) VALUES('${poster}', '${title}', '${releaseDate}', ${rating}, '${plot}') ON CONFLICT (title) DO NOTHING;`;

//     // writes the "insertMovie" query to the database
//     db.any(insertMovie)
//     .then((data) =>
//     {
//         res.status(201).send();
//     })
//     .catch((err) => 
//     {
//         res.status(404).send();
//         console.log("error: ", err);
//     });
// });

// // deletes all records in the movies table
// app.post('/delete-all', (req, res) =>
// {
//     // query to remove all rows from the movies table
//     var deleteAll = "DELETE FROM movies;";

//     // writes the "deleteAll" query to the database
//     db.any(deleteAll)
//     .then((data) =>
//     {
//         res.render('pages/searches',
//         {
//             myTitle: "Search History",
//             data: data
//         });
//     })
//     .catch((err) => 
//     {
//         res.render('pages/searches',
//         {
//             myTitle: "Search History",
//             data: null
//         });
//         console.log("error: ", err);
//     });
// });

// // route created to remove direct OMBD API calls from the frontend
// app.get('/omdb-info', async (req, res) => 
// {
//     const userSearch = req.query.search?.trim();
//     if (!userSearch) {
//         return res.status(400).json({ error: "No search term entered." });
//     }

//     // creates the url that will be used to call the OMDb API
//     let url = `https://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&`;
//     // IMDB ID's follow the format of "tt" followed by at least 7 digits https://developer.imdb.com/documentation/key-concepts
//     const imdbIDRegex = /[t]{2}\d{7,}/;

//     // enters if "userSearch" was an IMDB id. appends "userSearch" to "url" with the ID format, otherwise uses Title format
//     if (userSearch.match(imdbIDRegex)) {
//         url += `i=${userSearch}`;
//     }
//     else {
//         url += `t=${userSearch}`;
//     }

//     try {
//         const response = await fetch(url);
//         const data = await response.json();
//         res.json(data);
//     }
//     catch (err) {
//         res.status(500).json({ error: "Server error while fetching movie data." });
//     }
// });