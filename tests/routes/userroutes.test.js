/* eslint-disable */

const request = require('supertest');
const userModel = require('../../models/usermodel');
const app = "http://localhost:8000";

describe('POST /api/v1/users/signup', () => {
// beforeEach(async () => {
//     await userModel.deleteOne({ username: 'testuser' });
// },300000);
  it('should create a new user successfully', async () => {
    const user = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password',
      passwordConfirm: 'password',
      country:'egypt',
      gender:'woman',
      interests:['sports','music'],
    };
    const response = await request(app)
      .post('/api/v1/users/signup')
      .send(user);
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('token');
    expect(response.body.data).toHaveProperty('user');
    expect(response.body.data.user).toHaveProperty('_id');
    expect(response.body.data.user).toHaveProperty('email');
    expect(response.body.data.user).toHaveProperty('username');
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
});
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

describe('GET /api/v1/users/check/:username', () => {
  it('should check if a username is available', async () => {
    const username = 'newww';
    const response = await request(app).get(`/api/v1/users/check/${username}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('message', 'Username available');
  });
  it('should check if a username is not available', async () => {
    const username = 'mohamed';
    const response = await request(app).get(`/api/v1/users/check/${username}`);
    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty('message', 'Username not available');
  });
});
describe('GET /api/v1/users/:username/posts/:pageNumber', () => {
  it('should get a user\'s posts', async () => {
    const username = 'moaz';
    const pageNumber = 1;
    const response = await request(app).get(`/api/v1/users/${username}/posts/${pageNumber}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('status', 'success');
    expect(response.body.data).toHaveProperty('posts');
  });
});
describe('GET /api/v1/users/:username/comments/:pageNumber', () => {
  it('should get a user\'s comments', async () => {
    const username = 'moaz';
    const pageNumber = 1;
    const response = await request(app).get(`/api/v1/users/${username}/comments/${pageNumber}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('status', 'success');
    expect(response.body.data).toHaveProperty('comments');
  });
});
describe('GET /api/v1/users/:username/overview/:pageNumber', () => {
  it('should get a user\'s overview', async () => {
    const username = 'moaz';
    const pageNumber = 1;
    const response = await request(app).get(`/api/v1/users/${username}/overview/${pageNumber}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('status', 'success');
    expect(response.body.data).toHaveProperty('comments');
    expect(response.body.data).toHaveProperty('posts');
  });
});

describe('GET /api/v1/users/me/saved/:pageNumber', () => {
  it('should get a user\'s saved posts and comments', async () => {
    const pageNumber = 1;
    const response = await request(app).get(`/api/v1/users/me/saved/${pageNumber}`).set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('status', 'success');
    expect(response.body.data).toHaveProperty('comments');
    expect(response.body.data).toHaveProperty('posts');
  });
});
describe('GET /api/v1/users/me/hidden/:pageNumber', () => {
  it('should get a user\'s hidden posts', async () => {
    const username = 'moaz';
    const pageNumber = 1;
    const response = await request(app).get(`/api/v1/users/me/hidden/${pageNumber}`).set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('status', 'success');
    expect(response.body.data).toHaveProperty('posts');
  });
});
describe('GET /api/v1/users/me/upvoted/:pageNumber', () => {
  it('should get a user\'s upvoted posts and comments', async () => {
    const username = 'moaz';
    const pageNumber = 1;
    const response = await request(app).get(`/api/v1/users/me/upvoted/${pageNumber}`).set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('status', 'success');
    expect(response.body.data).toHaveProperty('comments');
    expect(response.body.data).toHaveProperty('posts');
  });
});
describe('GET /api/v1/users/me/downvoted/:pageNumber', () => {
  it('should get a user\'s downvoted posts and comments', async () => {
    const username = 'moaz';
    const pageNumber = 1;
    const response = await request(app).get(`/api/v1/users/me/downvoted/${pageNumber}`).set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('status', 'success');
    expect(response.body.data).toHaveProperty('comments');
    expect(response.body.data).toHaveProperty('posts');
  });
});
describe('GET /api/v1/users/:username', () => {
  it('should get a user by username', async () => {
    const username = 'moaz';
    const response = await request(app).get(`/api/v1/users/${username}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('status', 'success');
    expect(response.body.data).toHaveProperty('cakeDay');
    expect(response.body.data).toHaveProperty('commentKarma');
    expect(response.body.data).toHaveProperty('postKarma');
  });
});

describe('GET /api/v1/users/me/current', () => {
  it('should get the logged in user', async () => {
    const response = await request(app).get('/api/v1/users/me/current')
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('status', 'success');
    expect(response.body.data).toHaveProperty('user');
  });
});

describe('GET /api/v1/users/me/settings', () => {
  it('should get the logged in user\'s settings', async () => {
    const response = await request(app)
      .get('/api/v1/users/me/settings')
      .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('status', 'success');
    expect(response.body.data).toHaveProperty('settings');
  });
});

describe('POST /api/v1/users/me/friend/:username', () => {
  it('should add a user as a friend', async () => {
    const username = 'mariam';
    const response = await request(app)
      .post(`/api/v1/users/me/friend/${username}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('status', 'success');
    expect(response.body.data).toHaveProperty('user');
  });
});

describe('POST /api/v1/users/me/friend/:username', () => {
  it('should not add a user who is already a friend', async () => {
    const username = 'mariam';
    response = await request(app)
      .post(`/api/v1/users/me/friend/${username}`)
      .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(400); 
    expect(response.body.message).toBe('You have already followed this user');
    expect(response.body).toHaveProperty('status', 'fail');
  });
});

describe('DELETE /api/v1/users/me/friend/:username', () => {
  it('should remove a user from friends', async () => {
    const username = 'mariam';
    const response = await request(app)
      .delete(`/api/v1/users/me/friend/${username}`)
      .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(204);
  });
});

describe('POST /api/v1/users/me/block/:username', () => {
  it('should block a user', async () => {
    const username = 'mohamed';
    const response = await request(app)
      .post(`/api/v1/users/me/block/${username}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('status', 'success');
  });
});
describe('POST /api/v1/users/me/friend/:username', () => {
  it('should not add a blocked user as a friend', async () => {
    const username = 'mohamed';
    let response = await request(app)
      .post(`/api/v1/users/me/block/${username}`)
      .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(400); 
    expect(response.body.message).toBe('You have already blocked this user');
    expect(response.body).toHaveProperty('status', 'fail');
  });
});

describe('DELETE /api/v1/users/me/block/:username', () => {
  it('should unblock a user', async () => {
    const username = 'mohamed';
    const response = await request(app)
      .delete(`/api/v1/users/me/block/${username}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(204);
  });
});
// //ADMIN
// describe('DELETE /api/v1/users/admin/delete/:username', () => {
//   it('should delete a user', async () => {
//     const username = 'testuser';
//     // First, create the user
//     let response = await request(app)
//       .delete(`/api/v1/users/admin/delete/${username}`)
//       // .set('Authorization', `Bearer ${adminToken}`);
//     expect(response.statusCode).toBe(204);
//   });
// });