const express = require('express');
const cors = require('cors');
const client = require('./client.js');
const app = express();
const morgan = require('morgan');
const ensureAuth = require('./auth/ensure-auth');
const createAuthRoutes = require('./auth/create-auth-routes');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev')); // http logging

const authRoutes = createAuthRoutes();

// setup authentication routes to give user an auth token
// creates a /auth/signin and a /auth/signup POST route. 
// each requires a POST body with a .email and a .password
app.use('/auth', authRoutes);

// everything that starts with "/api" below here requires an auth token!
app.use('/api', ensureAuth);

// and now every request that has a token in the Authorization header will have a `req.userId` property for us to see who's talking
app.get('/api/test', (req, res) => {
  res.json({
    message: `in this proctected route, we get the user's id like so: ${req.userId}`
  });
});

app.get('/movies', async(req, res) => {
  try {
    const data = await client.query(`
    SELECT movies.id, 
          movies.name,
          movies.year,
          movies.oscars,
          movies.genre,
          genres.name as genre
    FROM movies
    JOIN genres
    ON genres.id = movies.genre_id
    `);
    
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.get('/genres', async(req, res) => {
  try {
    const data = await client.query('SELECT * from genres');
    
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.get('/movies/:id', async(req, res) => {
  try {
    const movieId = req.params.id;

    const data = await client.query(`
    SELECT *
    FROM movies
    WHERE movies.id=$1`,
    [movieId]);
    
    res.json(data.rows[0]);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

// add a new post route with path /movies
app.post('/movies', async(req, res) => {
  try {
    // get all the movie data from the POST body (the form in react)
    const newName = req.body.name;
    const newYear = req.body.year;
    const newOscars = req.body.oscars;
    const newGenreId = req.body.genre_id;
    const newOwnerId = req.body.owner_id;

    //use an insert statement to make a new movie
    const data = await client.query(`
    INSERT INTO movies (name, year, oscars, genre_id, owner_id)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *`,
 
    [newName, newYear, newOscars, newGenreId, newOwnerId]);

    res.json(data.rows[0]);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/movies/:id', async(req, res) => {
  try {
    const newName = req.body.name;
    const newYear = req.body.year;
    const newOscars = req.body.oscars;
    const newGenreId = req.body.genre_id;
    const newOwnerId = req.body.owner_id;

    const data = await client.query(`
    UPDATE movies
    SET name = $1,
        year = $2,
        oscars = $3,
        genre_id = $4,
        owner_id = $5
    WHERE movies.id = $6
    RETURNING *
    `,
    
    [newName, newYear, newOscars, newGenreId, newOwnerId, req.params.id]);

    res.json(data.rows[0]);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});


app.delete('/movies/:id', async(req, res) => {
  try {
    const movieId = req.params.id;

    const data = await client.query(`
    DELETE from movies
    WHERE movies.id=$1
    `,
    [movieId]);

    res.json(data.rows[0]);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});


app.use(require('./middleware/error'));

module.exports = app;
