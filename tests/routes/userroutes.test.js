/* eslint-disable */

const request = require('supertest');
const app = "http://localhost:8000";
describe('POST /api/v1/users/login', () => {
  it('should log in successfully', async () => {
    const userCredentials = {
      username: 'moaz',
      email: 'moaz123@yopmail.com',
      password: 'pass1234',
    };
    const response = await request(app).post('/api/v1/users/login').send(userCredentials);

  expect(response.statusCode).toBe(200);
  expect(response.body).toHaveProperty('token');
  expect(response.body.data.user).toHaveProperty('_id');
  expect(response.body.data.user).toHaveProperty('username');
  expect(response.body.data.user).toHaveProperty('email');
  expect(response.body.data.user).toHaveProperty('savedPostsAndComments');
  expect(response.body.data.user).toHaveProperty('upvotes');
  expect(response.body.data.user).toHaveProperty('downvotes');
  expect(response.body.data.user).toHaveProperty('karma');
  expect(response.body.data.user).toHaveProperty('dateJoined');
  expect(response.body.data.user).toHaveProperty('country');
  expect(response.body.data.user).toHaveProperty('gender');
  expect(response.body.data.user).toHaveProperty('followedUsers');
  expect(response.body.data.user).toHaveProperty('blockedUsers');
  expect(response.body.data.user).toHaveProperty('joinedSubreddits');
  expect(response.body.data.user).toHaveProperty('followedPosts');
  expect(response.body.data.user).toHaveProperty('viewedPosts');
  expect(response.body.data.user).toHaveProperty('hiddenPosts');
  expect(response.body.data.user).toHaveProperty('comments');
  expect(response.body.data.user).toHaveProperty('posts');
  expect(response.body.data.user).toHaveProperty('settings');
  expect(response.body.data.user).toHaveProperty('interests');
  expect(response.body.data.user).toHaveProperty('verificationToken');
  expect(response.body.data.user).toHaveProperty('verified');
  });
  it('should not log in a user with invalid credentials', async () => {
    const userCredentials = {
      username: 'testuser',
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
