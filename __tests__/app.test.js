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
          genre: 'fantasy',
          owner_id: 1
        },
        {
          id: 2,
          name: 'The Dark Knight',
          year: 2008,
          oscars: true,
          genre: 'superhero',
          owner_id: 1
        },
        {
          id: 3,
          name: 'Titanic',
          year: 1997,
          oscars: true,
          genre: 'romance',
          owner_id: 1
        },
        {
          id: 4,
          name: 'Dirty Dancing',
          year: 1987,
          oscars: true,
          genre: 'romance',
          owner_id: 1
        }
      ];

      const data = await fakeRequest(app)
        .get('/movies')
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
          genre: 'fantasy',
          owner_id: 1
        };

      const data = await fakeRequest(app)
        .get('/movies/1')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });
  });
});
