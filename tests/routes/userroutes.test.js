/* eslint-disable */

const request = require('supertest');
const app = "http://localhost:8000";

describe('POST /api/v1/users/signup', () => {
// beforeEach(async () => {
//     await userModel.deleteOne({ username: 'testuser' });
// },300000);

//REMOVE CREATED USER AND THEIR SETTINGS FROM DB TO BE ABLE TO TEST AGAIN
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
  });
});

//REMEMBER TO REVERSE PASSWORDS BACK IN POSTMAN TO BE ABLE TO TEST LOGIN
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
describe('GET /api/v1/users/:username/posts', () => {
  it('should get a user\'s posts', async () => {
    const username = 'moaz';
    const response = await request(app).get(`/api/v1/users/${username}/posts`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('status', 'success');
    expect(response.body.data).toHaveProperty('posts');
  });
});
describe('GET /api/v1/users/:username/comments', () => {
  it('should get a user\'s comments', async () => {
    const username = 'moaz';
    const response = await request(app).get(`/api/v1/users/${username}/comments`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('status', 'success');
    expect(response.body.data).toHaveProperty('comments');
  });
});
describe('GET /api/v1/users/:username/overview', () => {
  it('should get a user\'s overview', async () => {
    const username = 'moaz';
    const response = await request(app).get(`/api/v1/users/${username}/overview`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('status', 'success');
    expect(response.body.data).toHaveProperty('comments');
    expect(response.body.data).toHaveProperty('posts');
  });
});

describe('GET /api/v1/users/me/saved', () => {
  it('should get a user\'s saved posts and comments', async () => {
    const response = await request(app).get(`/api/v1/users/me/saved`).set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('status', 'success');
    expect(response.body.data).toHaveProperty('comments');
    expect(response.body.data).toHaveProperty('posts');
  });
});
describe('GET /api/v1/users/me/hidden', () => {
  it('should get a user\'s hidden posts', async () => {
    const username = 'moaz';
    const response = await request(app).get(`/api/v1/users/me/hidden`).set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('status', 'success');
    expect(response.body.data).toHaveProperty('posts');
  });
});
describe('GET /api/v1/users/me/upvoted', () => {
  it('should get a user\'s upvoted posts and comments', async () => {
    const username = 'moaz';
    const pageNumber = 1;
    const response = await request(app).get(`/api/v1/users/me/upvoted`).set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('status', 'success');
    expect(response.body.data).toHaveProperty('comments');
    expect(response.body.data).toHaveProperty('posts');
  });
});
describe('GET /api/v1/users/me/downvoted', () => {
  it('should get a user\'s downvoted posts and comments', async () => {
    const username = 'moaz';
    const pageNumber = 1;
    const response = await request(app).get(`/api/v1/users/me/downvoted`).set('Authorization', `Bearer ${token}`);
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
// REVERSE THE PASSWORD BACK IN POSTMAN TO BE ABLE TO TEST
describe('PATCH /api/v1/users/me/settings/changepassword', () => {
  it('should update a user password', async () => {
    // Assuming the user is already logged in and you have their token
    const currentPassword = 'pass1234';
    const newPassword = 'mariambackend';
    const passwordConfirm = 'mariambackend';

    const response = await request(app)
      .patch(`/api/v1/users/me/settings/changepassword`)
      .send({ currentPassword, newPassword, passwordConfirm })
      .set('Authorization', `Bearer ${token}`);
    token = response.body.token;  
    expect(response.statusCode).toBe(200)
    expect(response.body).toHaveProperty('status', 'success');
  });
});


describe('PATCH /api/v1/users/me/settings/changepassword', () => {
  it('should update a user password to his old password', async () => {
    // Assuming the user is already logged in and you have their token
    const currentPassword = 'mariambackend';
    const newPassword = 'pass1234';
    const passwordConfirm = 'pass1234';

    const response = await request(app)
      .patch(`/api/v1/users/me/settings/changepassword`)
      .send({ currentPassword, newPassword, passwordConfirm })
      .set('Authorization', `Bearer ${token}`);
    token = response.body.token;  
    expect(response.statusCode).toBe(200)
    expect(response.body).toHaveProperty('status', 'success');
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

describe('PATCH /api/v1/users/me/settings', () => {
  it('should update user settings', async () => {
    // Assuming the user is already logged in and you have their token
    const newSettings = {
      // Replace with the actual settings you want to update
      userProfile:{
        profilePicture: "newprofilepic"
    }  
    };

    const response = await request(app)
      .patch(`/api/v1/users/me/settings`)
      .send(newSettings)
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('status', 'success');
    expect(response.body.data.settings).toMatchObject(newSettings);
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

//REVERSE ACTIVE BACK IN POSTMAN TO BE ABLE TO TEST AGAIN
describe('DELETE /api/v1/users/me/current', () => {
  it('should deactivate a user', async () => {
    // Assuming the user is already logged in and you have their token
    const response = await request(app)
      .delete(`/api/v1/users/me/current`)
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