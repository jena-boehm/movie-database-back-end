require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;
  
    beforeAll(async done => {
      execSync('npm run setup-db');
  
      client.connect();
  
      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });
      
      token = signInData.body.token;
  
      return done();
    });
  
    afterAll(done => {
      return client.end(done);
    });

    test('returns movies', async() => {

      const expectation = [
        {
          id: 1,
          name: 'Harry Potter and the Sorcerer\'s Stone',
          year: 2001,
          oscars: false,
          genre: 'Fantasy',
          owner_id: 1
        },
        {
          id: 2,
          name: 'The Dark Knight',
          year: 2008,
          oscars: true,
          genre: 'Superhero',
          owner_id: 1
        },
        {
          id: 3,
          name: 'Titanic',
          year: 1997,
          oscars: true,
          genre: 'Romance',
          owner_id: 1
        },
        {
          id: 4,
          name: 'Dirty Dancing',
          year: 1987,
          oscars: true,
          genre: 'Romance',
          owner_id: 1
        }
      ];

      const data = await fakeRequest(app)
        .get('/movies')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('returns genres', async() => {

      const expectation = [
        {
          id: 1,
          genre: 'Fantasy'
        },
        {
          id: 2,
          genre: 'Superhero'
        },
        {
          id: 3,
          genre: 'Romance'
        }
      ];

      const data = await fakeRequest(app)
        .get('/genres')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });


    test('returns a single movie', async() => {

      const expectation = 
        {
          id: 1,
          name: 'Harry Potter and the Sorcerer\'s Stone',
          year: 2001,
          oscars: false,
          genre_id: 1,
          owner_id: 1
        };

      const data = await fakeRequest(app)
        .get('/movies/1')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });


    test('adds a movie to the DB and returns it', async() => {
      const expectation = {
        id: 5,
        name: 'Bee Movie',
        year: 2007, 
        oscars: false,
        genre_id: 3,
        owner_id: 1
      };

      const data = await fakeRequest(app)
        .post('/movies')
        .send({
          name: 'Bee Movie',
          year: 2007, 
          oscars: false,
          genre_id: 3,
          owner_id: 1
        })
        .expect('Content-Type', /json/)
        .expect(200);

      const allMovies = await fakeRequest(app)
        .get('/movies')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
      expect(allMovies.body.length).toEqual(5);
    });


    test('deletes a movie by id', async () => {
      const data = await fakeRequest(app)
        .delete('/movies/2')
        .expect('Content-Type', /json/)
        .expect(200);
      
      const allMovies = await fakeRequest(app)
        .get('/movies')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual('');
      expect(allMovies.body.length).toEqual(4);
    });


    test('updates a movie row', async() => {
      const expectation = {
        id: 3,
        name: 'Titanic II',
        year: 2015,
        oscars: true,
        genre_id: 3,
        owner_id: 1
      };
      
      const data = await fakeRequest(app)
        .put('/movies/3')
        .send({
          id: 3,
          name: 'Titanic II',
          year: 2015,
          oscars: true,
          genre_id: 3,
          owner_id: 1
        })
        .expect('Content-Type', /json/)
        .expect(200);
      
      const allMovies = await fakeRequest(app)
        .get('/movies')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
      expect(allMovies.body.length).toEqual(4);
    });
  });
});
