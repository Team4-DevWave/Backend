/* eslint-disable */

const request = require('supertest');
const app = "http://localhost:8000";

describe('POST /api/v1/users/signup', () => {

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

it('should not create a user with an existing email', async () => {
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
    expect(response.statusCode).toBe(401);

  });

  it('should not create a user with an existing username', async () => {
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
    expect(response.statusCode).toBe(401);

  });
    it('should not create a user with an existing username', async () => {
    const user = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password',
      country:'egypt',
      gender:'woman',
      interests:['sports','music'],
    };
    const response = await request(app)
      .post('/api/v1/users/signup')
      .send(user);
    expect(response.statusCode).toBe(401);

  });
});


//REMEMBER TO REVERSE PASSWORDS BACK IN POSTMAN TO BE ABLE TO TEST LOGIN
describe('POST /api/v1/users/login', () => {
  it('should log in successfully', async () => {
    const userCredentials = {
      username: 'testuser',
      password: 'password',
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
    const username = 'anonexisteduser';
    const response = await request(app).get(`/api/v1/users/check/${username}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('message', 'Username available');
  });
  it('should check if a username is not available', async () => {
    const username = 'testuser';
    const response = await request(app).get(`/api/v1/users/check/${username}`);
    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty('message', 'Username not available');
  });
  
});
describe('GET /api/v1/users/:username/posts', () => {
  it('should get a user\'s posts', async () => {
    const username = 'mohamed';
    const response = await request(app).get(`/api/v1/users/${username}/posts`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('status', 'success');
    expect(response.body.data).toHaveProperty('posts');
  });
  it('should not get a user\'s posts with an invalid username', async () => {
    const username = 'invalidusername';
    const response = await request(app).get(`/api/v1/users/${username}/posts`);
    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty('status', 'fail');
    expect(response.body).toHaveProperty('message', 'User not found');
  });
});

describe('GET /api/v1/users/:username/comments', () => {
  it('should get a user\'s comments', async () => {
    const username = 'mohamed';
    const response = await request(app).get(`/api/v1/users/${username}/comments`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('status', 'success');
    expect(response.body.data).toHaveProperty('comments');
  });
  it('should not get a user\'s comments with an invalid username', async () => {
    const username = 'invalidusername';
    const response = await request(app).get(`/api/v1/users/${username}/comments`);
    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty('status', 'fail');
    expect(response.body).toHaveProperty('message', 'User not found');
  });
});
describe('GET /api/v1/users/:username/overview', () => {
  it('should get a user\'s overview', async () => {
    const username = 'mohamed';
    const response = await request(app).get(`/api/v1/users/${username}/overview`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('status', 'success');
    expect(response.body.data).toHaveProperty('comments');
    expect(response.body.data).toHaveProperty('posts');
  });
  it('should not get a user\'s overview with an invalid username', async () => {
    const username = 'invalidusername';
    const response = await request(app).get(`/api/v1/users/${username}/overview`);
    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty('status', 'fail');
    expect(response.body).toHaveProperty('message', 'User not found');
  });
});

describe('GET /api/v1/users/:username/about', () => {//CHECK
  it('should get a user\'s about', async () => {
    const username= 'mohamed';
    const response = await request(app).get(`/api/v1/users/${username}/about`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('status', 'success');
  });
  it('should not get a user\'s about with an invalid username', async () => {
    const username = 'invalidusername';
    const response = await request(app).get(`/api/v1/users/${username}/about`);
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('status', 'fail');
    expect(response.body).toHaveProperty('message', 'User not found');
  }); 

});

describe('GET /api/v1/users/:username', () => {
  it('should get a user by username', async () => {
    const username = 'mohamed';
    const response = await request(app).get(`/api/v1/users/${username}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('status', 'success');
  });

  it('should not get a user with an invalid username', async () => {
    const username = 'invalidusername';
    const response = await request(app).get(`/api/v1/users/${username}`);
    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty('status', 'fail');
    expect(response.body).toHaveProperty('message', 'No user with that username');
  });
});

describe('GET /api/v1/users/checkEmail/:email', () => {
  it('should check email availability', async () => {
    // Assuming the user is already logged in and you have their token
    const newEmail = 'newemaillllll123@yopmail.com';
    const response = await request(app)
      .get(`/api/v1/users/checkEmail/${newEmail}`)
      .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('status', 'success');
  });
    it('should check email unavailability', async () => {
    // Assuming the user is already logged in and you have their token
    const newEmail = 'mariamgamal70.backup@gmail.com';
    const response = await request(app)
      .get(`/api/v1/users/checkEmail/${newEmail}`)
      .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty('status', 'fail');
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
    const response = await request(app).get(`/api/v1/users/me/hidden`).set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('status', 'success');
    expect(response.body.data).toHaveProperty('posts');
  });
});
describe('GET /api/v1/users/me/upvoted', () => {
  it('should get a user\'s upvoted posts and comments', async () => {
    const response = await request(app).get(`/api/v1/users/me/upvoted`).set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('status', 'success');
    expect(response.body.data).toHaveProperty('comments');
    expect(response.body.data).toHaveProperty('posts');
  });
});
describe('GET /api/v1/users/me/downvoted', () => {
  it('should get a user\'s downvoted posts and comments', async () => {
    const response = await request(app).get(`/api/v1/users/me/downvoted`).set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('status', 'success');
    expect(response.body.data).toHaveProperty('comments');
    expect(response.body.data).toHaveProperty('posts');
  });
});
describe('GET /api/v1/users/:username', () => {
  it('should get a user by username', async () => {
    const username = 'mohamed';
    const response = await request(app).get(`/api/v1/users/${username}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('status', 'success');
    // expect(response.body.data).toHaveProperty('cakeDay');
    // expect(response.body.data).toHaveProperty('commentKarma');
    // expect(response.body.data).toHaveProperty('postKarma');
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
    const currentPassword = 'password';
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
    const newPassword = 'password';
    const passwordConfirm = 'password';

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
        allowFollowers: true,
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

  it('should not add a user as a friend with an invalid username', async () => {
    const username = 'invalidusername';
    const response = await request(app)
      .post(`/api/v1/users/me/friend/${username}`)
      .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty('status', 'fail');
    expect(response.body).toHaveProperty('message', 'No user with that username');
  }); 

  it('should not add a user who is already a friend', async () => {
    const username = 'mariam';
    const response = await request(app)
      .post(`/api/v1/users/me/friend/${username}`)
      .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('status', 'fail');
    expect(response.body).toHaveProperty('message', 'You have already followed this user');
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

  it('should not block a user with an invalid username', async () => {
    const username = 'invalidusername';
    const response = await request(app)
      .post(`/api/v1/users/me/block/${username}`)
      .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty('status', 'fail');
    expect(response.body).toHaveProperty('message', 'No user with that username');
  });

  it('should not block a user who is already blocked', async () => {
    const username = 'mohamed';
    const response = await request(app)
      .post(`/api/v1/users/me/block/${username}`)
      .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('status', 'fail');
    expect(response.body).toHaveProperty('message', 'You have already blocked this user');
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

  it('should not remove a user who is not a friend', async () => {
    const username = 'mariam';
    const response = await request(app)
      .delete(`/api/v1/users/me/friend/${username}`)
      .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('status', 'fail');
    expect(response.body).toHaveProperty('message', 'You haven\'t followed this user');
  });

  it('should not remove a user with an invalid username', async () => {
    const username = 'invalidusername';
    const response = await request(app)
      .delete(`/api/v1/users/me/friend/${username}`)
      .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty('status', 'fail');
    expect(response.body).toHaveProperty('message', 'No user with that username');
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

describe('GET /api/v1/users/me/history', () => {
  it('should get a user\'s viewed posts', async () => {
    const response = await request(app).get(`/api/v1/users/me/history`).set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('status', 'success');
    expect(response.body.data).toHaveProperty('posts');
  });
});

describe('PATCH /api/v1/users/me/settings/changecountry', () => {
  it('should update a user\'s country', async () => {
    const newCountry = 'egypt';
    const response = await request(app)
      .patch(`/api/v1/users/me/settings/changecountry`)
      .send({ country: newCountry })
      .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('status', 'success');
  });
});

describe('PATCH /api/v1/users/me/changeGender', () => {
  it('should update a user gender', async () => { 
    const gender='woman';
    const response = await request(app)
      .patch(`/api/v1/users/me/changeGender`)
      .send(gender)
      .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('status', 'success');
  });
});

describe('PATCH /api/v1/users/me/changeDisplayName', () => {
  it('should update a user display name', async () => {
    const displayName='mimi';
    const response = await request(app)
      .patch(`/api/v1/users/me/changeDisplayName`)
      .send(displayName)
      .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('status', 'success');
  });
});

describe('POST /api/v1/users/me/settings/addsociallink', () => {
  it('should add a social link', async () => {
    const socialLink = {
      socialType: 'facebook',
      url: 'https://www.facebook.com',
    };
    const response = await request(app)
      .post(`/api/v1/users/me/settings/addsociallink`)
      .send(socialLink)
      .set('Authorization', `Bearer ${token}`);
    socialLinkId = response.body.data.socialLinks[0]._id;
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('status', 'success');
  });
});

describe('DELETE /api/v1/users/me/settings/removesociallink/:sociallinkid', () => {
  it('should remove a social link', async () => {
    const response = await request(app)
      .delete(`/api/v1/users/me/settings/removesociallink/${socialLinkId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(204);
  });

  it('should not remove a social link with an invalid id', async () => {
    const response = await request(app)
      .delete(`/api/v1/users/me/settings/removesociallink/invalidid`)
      .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty('status', 'fail');
    expect(response.body).toHaveProperty('message', 'No social link with that id');
  });
});

describe('PATCH /api/v1/users/me/settings/changeemail', () => {
  it('should update a user email', async () => {
    const newEmail = 'mimi123@yopmail.com';
    const response = await request(app)
      .patch(`/api/v1/users/me/settings/changeemail`)
      .send({ email: newEmail })
      .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('status', 'success');
  });
}); 

// //REVERSE ACTIVE BACK IN POSTMAN TO BE ABLE TO TEST AGAIN
// describe('DELETE /api/v1/users/me/current', () => {
//   it('should deactivate a user', async () => {
//     // Assuming the user is already logged in and you have their token
//     const response = await request(app)
//       .delete(`/api/v1/users/me/current`)
//       .set('Authorization', `Bearer ${token}`);

//     expect(response.statusCode).toBe(204);
//   });
// });
describe('post /api/v1/users/forgetUsername', () => {
  it('should get the username to email', async () => {
    const reqData = {
      email: 'modyben43@gmail.com',
    };
    const response = await request(app)
      .post('/api/v1/users/forgotUsername').send(reqData);
    expect(response.statusCode).toBe(200);
  });
});
describe('post /api/v1/users/forgetUsername', () => {
  it('should get the logged in user\'s settings', async () => {
    const response = await request(app)
      .post('/api/v1/users/forgotUsername').send({email: 'modyben4@gmail.com'});
    expect(response.statusCode).toBe(404);
  });
});
describe('post /api/v1/users/forgetUsername', () => {
  it('should get the logged in user\'s settings', async () => {
    const response = await request(app)
      .post('/api/v1/users/forgotUsername').send({});
    expect(response.statusCode).toBe(400);
  });
});

describe('DELETE /api/v1/users/:username/delete', () => {
  it('should delete a user', async () => {
    username='testuser';
    const response = await request(app)
                    .delete(`/api/v1/users/${username}/delete`)
                    .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(204);
  })
});