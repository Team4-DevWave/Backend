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

describe('POST /api/v1/r/create_community', () => {
           
  //REMOVE CREATED USER AND THEIR SETTINGS FROM DB TO BE ABLE TO TEST AGAIN
  it('should create a community successfully', async () => {
    const communityData = {
      "name": "Empire Bay",
      "srType": "public",
      "nsfw": false
  };
    const response = await request(app).post(`/api/v1/r/create_community`).send(communityData).set('Authorization', `Bearer ${token}`);;
   console.log(response);
   expect(response.statusCode).toBe(201);
    expect(response.body.data).toHaveProperty('newCommunity');
 });

 it('should not create a community due to community already exists', async () => {
  const communityData = {
    "name": "planetOfTheApes",
    "srType": "public",
    "nsfw": false
};
const response = await request(app).post(`/api/v1/r/create_community`).send(communityData).set('Authorization', `Bearer ${token}`);;
console.log(response);
expect(response.statusCode).toBe(409);
expect(response.body).toHaveProperty('status', 'fail');
expect(response.body).toHaveProperty('message', 'Subreddit already exists');
});
 })

 describe('GET /api/v1/homepage/submit', () => {
           
  //REMOVE CREATED USER AND THEIR SETTINGS FROM DB TO BE ABLE TO TEST AGAIN
  it('should get communities successfully', async () => {
    const response = await request(app).get(`/api/v1/homepage/submit`).send().set('Authorization', `Bearer ${token}`);;
    expect(response.statusCode).toBe(200);
    expect(response.body.data).toHaveProperty('communities');
    expect(response.body.data).toHaveProperty('userCommunities');
 });
 })

 describe('POST /api/v1/r/:subreddit/subscribe', () => {
           
  //REMOVE CREATED USER AND THEIR SETTINGS FROM DB TO BE ABLE TO TEST AGAIN
  it('should join a user in a community successfully', async () => {
    const subreddit = 'sabaken_el_testing';
    const response = await request(app).post(`/api/v1/r/${subreddit}/subscribe`).send().set('Authorization', `Bearer ${token}`);;
    expect(response.statusCode).toBe(201);
    expect(response.body.data).toHaveProperty('subreddit');
 });

 it('should not join a user in a community that does not exist', async () => {
  const subreddit = 'sabaken_elfd_testing';
  const response = await request(app).post(`/api/v1/r/${subreddit}/subscribe`).send().set('Authorization', `Bearer ${token}`);;
  expect(response.statusCode).toBe(404);
  expect(response.body).toHaveProperty('status', 'fail');
  expect(response.body).toHaveProperty('message', 'Subreddit does not exist');
});

it('should not join a user in a private community that does not have an invite', async () => {
  const subreddit = 'elemod7eken';
  const response = await request(app).post(`/api/v1/r/${subreddit}/subscribe`).send().set('Authorization', `Bearer ${token}`);;
  expect(response.statusCode).toBe(403);
  expect(response.body).toHaveProperty('status', 'fail');
  expect(response.body).toHaveProperty('message', 'You cannot have access to this subreddit as it is private');
});

it('should not join a user in a community as the user is already in the community', async () => {
  const subreddit = 'planetOfTheApes';
  const response = await request(app).post(`/api/v1/r/${subreddit}/subscribe`).send().set('Authorization', `Bearer ${token}`);;
  expect(response.statusCode).toBe(409);
  expect(response.body).toHaveProperty('status', 'fail');
  expect(response.body).toHaveProperty('message', 'You are already a member of this subreddit');
});
})