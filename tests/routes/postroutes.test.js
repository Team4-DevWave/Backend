/* eslint-disable */

const request = require('supertest');
const userModel = require('../../models/usermodel');
const app = "http://localhost:8000";


describe('POST /api/v1/users/login', () => {
  it('should log in successfully', async () => {
    const userCredentials = {
      username: 'moaz',
      email: 'moaz123@yopmail.com',
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

describe('POST /api/v1/posts/submit/u/moaz', () => {
  
  //REMOVE CREATED USER AND THEIR SETTINGS FROM DB TO BE ABLE TO TEST AGAIN
    it('should create a new post on the user profile successfully', async () => {
      const post = {
        title: "Test",
        type: "text",
        spoiler: false,
        nsfw: false,
        content: "ho ho ho",
        locked: false
      };
      const response = await request(app).post('/api/v1/posts/submit/u/moaz').send(post).set('Authorization', `Bearer ${token}`);;
      expect(response.statusCode).toBe(201);
      expect(response.body.data).toHaveProperty('post');
    });
  });
  