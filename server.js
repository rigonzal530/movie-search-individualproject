// Imported libraries
require('dotenv').config();         // ensures environment variables are available before continuing
const path = require('path');       // ensures node.js path module is loaded for cross-platform path support
const express = require('express'); // ensures express framework has been added

// custom imports
const userRoutes = require('./src/routes/users.routes');
const movieRoutes = require('./src/routes/movies.routes');
const errorHandler = require('./src/middleware/errors');

const app = express();

app.use(express.json());                            // support json encoded bodies
app.use(express.urlencoded({ extended: true }));    // support encoded bodies

// set the view engine to ejs
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));
app.use(express.static(path.join(__dirname, 'src', 'public'))); // necessary for us access our public resources directory

app.use('/users', userRoutes);
app.use('/movies', movieRoutes);

// renders the home page
app.get('/', (req, res) => {
    res.render('pages/home', { myTitle: "Home" });
});

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`${PORT} is the magic port`);
});

module.exports = app;