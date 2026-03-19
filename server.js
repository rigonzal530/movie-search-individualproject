// Imported libraries
require('dotenv').config();         // ensures environment variables are available before continuing
const path = require('path');       // ensures node.js path module is loaded for cross-platform path support
const express = require('express'); // ensures express framework has been added
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);

// custom imports
const db = require('./src/db/connection')
const userRoutes = require('./src/routes/users.routes');
const movieRoutes = require('./src/routes/movies.routes');
const userApiRoutes = require('./src/routes/users.api.routes');
const movieApiRoutes = require('./src/routes/movies.api.routes');
const errorHandler = require('./src/middleware/errors');
const viewUser = require('./src/middleware/viewUser');

const app = express();

const isProduction = process.env.NODE_ENV === 'production';
if (isProduction) {
    app.set('trust proxy', 1);
}

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views')); // sets the directory where EJS templates are located
app.set('layout', 'layout'); // sets the default layout for all views to be rendered within layout.ejs

app.use(express.json());                            // support json encoded bodies
app.use(express.urlencoded({ extended: true }));    // support encoded bodies
app.use(express.static(path.join(__dirname, 'src', 'public'))); // necessary for us access our public resources directory
app.use(expressLayouts);

app.use(session({
    name: 'movie_search_session',
    store: new pgSession({
        pgPromise: db,
        tableName: 'user_sessions',
        createTableIfMissing: true
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
    }
}))

app.use(viewUser); // allows logged in user's details to be used within EJS templates
app.use('/', userRoutes);
app.use('/movies', movieRoutes);
app.use('/api/users', userApiRoutes);
app.use('/api/movies', movieApiRoutes);

// renders the home page
app.get('/', (req, res) => {
    res.render('pages/home', { pageTitle: "Home" });
});

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    if (!isProduction) {console.log(`http://localhost:${PORT} is the magic port`);}
});

module.exports = app;