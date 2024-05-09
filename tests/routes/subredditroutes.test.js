/* eslint-disable */

const request = require('supertest');
const app = "http://localhost:8000";
const userController = require('../../controllers/usercontroller');
const commentcontroller = require('../../controllers/commentcontroller');
const postcontroller = require('../../controllers/postcontroller');
const subredditcontroller = require('../../controllers/subredditcontroller');
const notificationcontroller = require('../../controllers/notificationcontroller');
const errorcontroller = require('../../controllers/errorcontroller');
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

describe('POST /api/v1/r/create', () => {
  //REMOVE CREATED USER AND THEIR SETTINGS FROM DB TO BE ABLE TO TEST AGAIN
  it('should create a community successfully', async () => {
    subredditName = 'community' + Math.floor(Math.random() * 10000);
    const communityData = {
      name: subredditName, 
      srType: "public",
      nsfw: false
  };
    const response = await request(app).post(`/api/v1/r/create`).send(communityData).set('Authorization', `Bearer ${token}`);;
    expect(response.statusCode).toBe(201);
    expect(response.body.data).toHaveProperty('newCommunity');
 });

  it('should not create a community due to community already exists', async () => {
    const communityData = {
      name : "firstcommunity",
      srType : "public",
      nsfw : false
  };
  const response = await request(app).post(`/api/v1/r/create`).send(communityData).set('Authorization', `Bearer ${token}`);;
  expect(response.statusCode).toBe(409);
  expect(response.body).toHaveProperty('status', 'fail');
  expect(response.body).toHaveProperty('message', 'Subreddit already exists');
  });
})

 describe('GET /api/v1/r/all', () => {
  //REMOVE CREATED USER AND THEIR SETTINGS FROM DB TO BE ABLE TO TEST AGAIN
  it('should get communities successfully', async () => {
    const response = await request(app)
                    .get(`/api/v1/r/all`)
                    .set('Authorization', `Bearer ${token}`);;
    expect(response.statusCode).toBe(200);
    expect(response.body.data).toHaveProperty('subreddits');
 });
 })

 describe('POST /api/v1/r/:subreddit/subscribe', () => {
  it('should log in successfully', async () => {
    const userCredentials = {
      username: 'mohamed',
      password: 'pass1234',
    };
    const response = await request(app).post('/api/v1/users/login').send(userCredentials);
    membertoken = response.body.token;
  expect(response.statusCode).toBe(200);
  expect(response.body).toHaveProperty('token');
  expect(response.body.data).toHaveProperty('user');
  });
  //REMOVE CREATED USER AND THEIR SETTINGS FROM DB TO BE ABLE TO TEST AGAIN
    it('should join a user in a community successfully', async () => {
    const subreddit = subredditName;
    const response = await request(app)
                    .post(`/api/v1/r/${subreddit}/subscribe`)
                    .set('Authorization', `Bearer ${membertoken}`);;
    expect(response.statusCode).toBe(200);
 });

  it('should not join a user in a community that does not exist', async () => {
    const subreddit = 'sabaken_elfd_testing';
    const response = await request(app).post(`/api/v1/r/${subreddit}/subscribe`).send().set('Authorization', `Bearer ${token}`);;
    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty('status', 'fail');
    expect(response.body).toHaveProperty('message', 'Subreddit does not exist');
  });

  it('should not join a user in a private community that does not have an invite', async () => {
    const subreddit = 'private community';
    const response = await request(app).post(`/api/v1/r/${subreddit}/subscribe`).send().set('Authorization', `Bearer ${membertoken}`);;
    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty('status', 'fail');
    expect(response.body).toHaveProperty('message', 'You cannot have access to this subreddit as it is private');
  });

  it('should not join a user in a community as the user is already in the community', async () => {
    const subreddit = 'planetOfTheApes';
    const response = await request(app).post(`/api/v1/r/${subredditName}/subscribe`).send().set('Authorization', `Bearer ${membertoken}`);;
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('status', 'fail');
    expect(response.body).toHaveProperty('message', 'You are already subscribed to this subreddit');
  });
});

describe('POST /api/v1/r/:subreddit/unsubscribe', () => {
  it('should unsubscribe a user from a community successfully', async () => {
    const subreddit = subredditName;
    const response = await request(app)
                    .delete(`/api/v1/r/${subreddit}/unsubscribe`)
                    .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
  });
});

describe('DELETE /api/v1/r/:subreddit/delete', () => {
  it('should delete a community successfully', async () => {
    const response = await request(app)
                    .delete(`/api/v1/r/${subredditName}/delete`)
                    .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(204);
  });
  it('should not delete a community that does not exist', async () => {
    const subreddit = 'sabaken_elfd_testing';
    const response = await request(app)
                    .delete(`/api/v1/r/${subreddit}/delete`)
                    .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(404);
  });
});