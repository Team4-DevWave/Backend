/* eslint-disable */

const request = require('supertest');
const userModel = require('../../models/usermodel');
const app = "http://localhost:8000";


describe('POST /api/v1/users/login', () => {
  it('should log in successfully', async () => {
    const userCredentials = {
      username: 'mariam',
      password: 'pass1234',
    };
    const response = await request(app).post('/api/v1/users/login').send(userCredentials);
    token = response.body.token;
  expect(response.statusCode).toBe(200);
  expect(response.body).toHaveProperty('token');
  expect(response.body.data).toHaveProperty('user');
  });
  it('should not log in a user with invalid credentials', async () => {
    const userCredentials = {
      username: 'testuser1',
      email: 'test@example.com',
      password: 'wrongpassword',
    };

    const response = await request(app)
      .post('/api/v1/users/login')
      .send(userCredentials);
    expect(response.statusCode).toBe(401);
    expect(response.body).not.toHaveProperty('token');
    expect(response.body).toHaveProperty('status', 'fail');
    expect(response.body).toHaveProperty('message', 'Incorrect email or password');
  });
});

describe('GET /api/v1/homepage/trending', () => {
  it('should return top trends', async () => {
    const response = await request(app).get('/api/v1/homepage/trending').send().set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.data).toHaveProperty('trends');
  }, 20000)
});

describe('GET /api/v1/homepage/subreddits_by_category', () => {
  it('should return subreddits by specific category', async () => {
    const body = {
      random: false,
      category: 'Sports'
    };
    const response = await request(app).get('/api/v1/homepage/subreddits_by_category').send(body).set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.data).toHaveProperty('result');
  });

  it('should return subreddits by random category', async () => {
    const body = {
      random: true,
    };
    const response = await request(app).get('/api/v1/homepage/subreddits_by_category').send(body).set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.data).toHaveProperty('result');
  },20000);
});