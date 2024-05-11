/* eslint-disable */

const request = require('supertest');
const userController = require('../../controllers/usercontroller');
const commentcontroller = require('../../controllers/commentcontroller');
const postcontroller = require('../../controllers/postcontroller');
const subredditcontroller = require('../../controllers/subredditcontroller');
const notificationcontroller = require('../../controllers/notificationcontroller');
const errorcontroller = require('../../controllers/errorcontroller');
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

describe('GET /api/v1/notifications', () => {
  it('should return user notifications successfully', async () => {
    const response = await request(app)
    .get('/api/v1/notifications')
    .send()
    .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.data).toHaveProperty('notifications');
  });
})

describe('PATCH /api/v1/notifications/hide/:notification_id', () => {
  it('should hide a notification successfully', async () => {
    const senderCredentials = {
      username: 'pixels',
      password: 'password'
    };

    const receiverCredentials = {
      username: 'mariam',
      password: 'pass1234'
    };

    const senderUser = await request(app)
    .post('/api/v1/users/login')
    .send(senderCredentials);

    token = senderUser.body.token;

    await request(app)
    .post(`/api/v1/users/me/friend/${receiverCredentials.username}`)
    .send()
    .set('Authorization', `Bearer ${token}`);

    await request(app)
    .del(`/api/v1/users/me/friend/${receiverCredentials.username}`)
    .send()
    .set('Authorization', `Bearer ${token}`);

    const receiverUser = await request(app)
    .post('/api/v1/users/login')
    .send(receiverCredentials);

    token = receiverUser.body.token;

    const notification = await request(app)
    .get('/api/v1/notifications')
    .send()
    .set('Authorization', `Bearer ${token}`);
    
    const response = await request(app)
    .patch(`/api/v1/notifications/hide/${notification.body.data.notifications[0]._id}`)
    .send()
    .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('success');
  }, 20000);
});

describe('PATCH /api/v1/notifications/disable_updates/:subreddit_name', () => {
  it('should disable subreddit updates successfully', async () => {
    const subreddit = 'Flutter Community';
    const response = await request(app)
    .patch(`/api/v1/notifications/disable_updates/${subreddit}`)
    .send()
    .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('success');
  });
})

describe('PATCH /api/v1/notifications/mark_all_read', () => {
  it('should mark all notifications as read successfully', async () => {
    const response = await request(app)
    .patch('/api/v1/notifications/mark_all_read')
    .send()
    .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('success');
  });
})

describe('PATCH /api/v1/notifications/read/:notification_id', () => {
  it('should mark a notification as read successfully', async () => {
    const senderCredentials = {
      username: 'pixels',
      password: 'password'
    };

    const receiverCredentials = {
      username: 'mariam',
      password: 'pass1234'
    };

    const senderUser = await request(app)
    .post('/api/v1/users/login')
    .send(senderCredentials);

    token = senderUser.body.token;

    await request(app)
    .post(`/api/v1/users/me/friend/${receiverCredentials.username}`)
    .send()
    .set('Authorization', `Bearer ${token}`);

    await request(app)
    .del(`/api/v1/users/me/friend/${receiverCredentials.username}`)
    .send()
    .set('Authorization', `Bearer ${token}`);

    const receiverUser = await request(app)
    .post('/api/v1/users/login')
    .send(receiverCredentials);

    token = receiverUser.body.token;

    const notification = await request(app)
    .get('/api/v1/notifications')
    .send()
    .set('Authorization', `Bearer ${token}`);
    
    const response = await request(app)
    .patch(`/api/v1/notifications/read/${notification.body.data.notifications[0]._id}`)
    .send()
    .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('success');
  }, 20000);
})

describe('GET /api/v1/notifications/settings', () => {
  it('should get user notifications settings successfully', async () => {
    const response = await request(app)
    .get('/api/v1/notifications/settings')
    .send()
    .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.data).toHaveProperty('notificationsSettings');
  });
})

describe('PATCH /api/v1/notifications/change_user_mod_notifications_settings/:subredditKey', () => {
  it('should toggle allow mod notifications setting successfully', async () => {
    const subreddit = 'spacers'
    const response = await request(app)
    .patch(`/api/v1/notifications/change_user_mod_notifications_settings/${subreddit}`)
    .send()
    .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('success');
  });
})

describe('PATCH /api/v1/notifications/change_user_mod_notifications_settings/spacers/activity', () => {
  it('should toggle new posts setting successfully', async () => {
    const subreddit = 'spacers'
    const response = await request(app)
    .patch(`/api/v1/notifications/change_user_mod_notifications_settings/${subreddit}/activity`)
    .send()
    .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('success');
  }, 20000);
})

describe('PATCH /api/v1/notifications/change_user_mod_notifications_settings/spacers/activity/postsWithUpvotes', () => {
  it('should toggle notififcations about posts with upvotes setting successfully', async () => {
    const subreddit = 'spacers'
    const response = await request(app)
    .patch(`/api/v1/notifications/change_user_mod_notifications_settings/${subreddit}/activity/postsWithUpvotes`)
    .send()
    .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('success');
  });
})

describe('PATCH /api/v1/notifications/change_user_mod_notifications_settings/spacers/activity/postsWithComments', () => {
  it('should toggle notififcations about posts with comments setting successfully', async () => {
    const subreddit = 'spacers'
    const response = await request(app)
    .patch(`/api/v1/notifications/change_user_mod_notifications_settings/${subreddit}/activity/postsWithComments`)
    .send()
    .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('success');
  });
})

describe('PATCH /api/v1/notifications/change_user_mod_notifications_settings/spacers/activity/postsWithComments/advancedSetup', () => {
  it('should toggle advanced setup setting successfully', async () => {
    const subreddit = 'spacers'
    const response = await request(app)
    .patch(`/api/v1/notifications/change_user_mod_notifications_settings/${subreddit}/activity/postsWithComments/advancedSetup`)
    .send()
    .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('success');
  });
})

describe('PATCH /api/v1/notifications/change_user_mod_notifications_settings/spacers/activity/postsWithComments/advancedSetup', () => {
  it('should toggle advanced setup for posts with comments setting successfully', async () => {
    const subreddit = 'spacers'
    const response = await request(app)
    .patch(`/api/v1/notifications/change_user_mod_notifications_settings/${subreddit}/activity/postsWithComments/advancedSetup`)
    .send()
    .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('success');
  });
})

describe('PATCH /api/v1/notifications/change_user_mod_notifications_settings/spacers/activity/postsWithUpvotes/advancedSetup', () => {
  it('should toggle advanced setup for posts with upvotes setting successfully', async () => {
    const subreddit = 'spacers'
    const response = await request(app)
    .patch(`/api/v1/notifications/change_user_mod_notifications_settings/${subreddit}/activity/postsWithUpvotes/advancedSetup`)
    .send()
    .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('success');
  });
})

describe('PATCH /api/v1/notifications/change_user_mod_notifications_settings/spacers/activity/postsWithUpvotes/advancedSetup/6', () => {
  it('should change number of upvotes for posts with upvotes setting successfully', async () => {
    const subreddit = 'spacers'
    const response = await request(app)
    .patch(`/api/v1/notifications/change_user_mod_notifications_settings/${subreddit}/activity/postsWithUpvotes/advancedSetup/6`)
    .send()
    .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('success');
  });
})

describe('PATCH /api/v1/notifications/change_user_mod_notifications_settings/spacers/activity/postsWithComments/advancedSetup/6', () => {
  it('should change number of comments for posts with comments setting successfully', async () => {
    const subreddit = 'spacers'
    const response = await request(app)
    .patch(`/api/v1/notifications/change_user_mod_notifications_settings/${subreddit}/activity/postsWithComments/advancedSetup/6`)
    .send()
    .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('success');
  });
})

describe('PATCH /api/v1/notifications/change_user_mod_notifications_settings/spacers/reports/posts', () => {
  it('should toggle notififcations about posts reports setting successfully', async () => {
    const subreddit = 'spacers'
    const response = await request(app)
    .patch(`/api/v1/notifications/change_user_mod_notifications_settings/${subreddit}/reports/posts`)
    .send()
    .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('success');
  });
})

describe('PATCH /api/v1/notifications/change_user_mod_notifications_settings/spacers/reports/posts/advancedSetup', () => {
  it('should toggle advanced setup for posts with reports setting successfully', async () => {
    const subreddit = 'spacers'
    const response = await request(app)
    .patch(`/api/v1/notifications/change_user_mod_notifications_settings/${subreddit}/reports/posts/advancedSetup`)
    .send()
    .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('success');
  }, 20000);
})

describe('PATCH /api/v1/notifications/change_user_mod_notifications_settings/spacers/reports/comments/advancedSetup', () => {
  it('should toggle advanced setup for comments with reports setting successfully', async () => {
    const subreddit = 'spacers'
    const response = await request(app)
    .patch(`/api/v1/notifications/change_user_mod_notifications_settings/${subreddit}/reports/comments/advancedSetup`)
    .send()
    .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('success');
  });
})

describe('PATCH /api/v1/notifications/change_user_mod_notifications_settings/spacers/reports/comments', () => {
  it('should toggle notififcations about posts reports setting successfully', async () => {
    const subreddit = 'spacers'
    const response = await request(app)
    .patch(`/api/v1/notifications/change_user_mod_notifications_settings/${subreddit}/reports/comments`)
    .send()
    .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('success');
  });
})

describe('PATCH /api/v1/notifications/change_user_mod_notifications_settings/spacers/reports/posts/advancedSetup/6', () => {
  it('should change number of reports for posts setting successfully', async () => {
    const subreddit = 'spacers'
    const response = await request(app)
    .patch(`/api/v1/notifications/change_user_mod_notifications_settings/${subreddit}/reports/posts/advancedSetup/6`)
    .send()
    .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('success');
  });
})

describe('PATCH /api/v1/notifications/change_user_mod_notifications_settings/spacers/reports/comments/advancedSetup/6', () => {
  it('should change number of reports for comments setting successfully', async () => {
    const subreddit = 'spacers'
    const response = await request(app)
    .patch(`/api/v1/notifications/change_user_mod_notifications_settings/${subreddit}/reports/comments/advancedSetup/6`)
    .send()
    .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('success');
  }, 20000);
})

describe('PATCH /api/v1/notifications/change_user_settings', () => {
  it('should change user notifications setting successfully', async () => {
    const setting = 'privateMessages'
    const response = await request(app)
    .patch('/api/v1/notifications/change_user_settings')
    .send(setting)
    .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('success');
  });
})

describe('GET /api/v1/notifications/get_number_of_notifications', () => {
  it('should get the numeber of unread notifications successfully', async () => {
    const response = await request(app)
    .get('/api/v1/notifications/get_number_of_notifications')
    .send()
    .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.data).toHaveProperty('number');
  });
})

describe('PATCH /api/v1/notifications/change_subreddit_notifications_settings', () => {
  it('should change community alerts successfully', async () => {
    const setting = 'privateMessages';
    const subreddit = 'spacers';
    const response = await request(app)
    .patch('/api/v1/notifications/change_subreddit_notifications_settings')
    .send(setting, subreddit)
    .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('success');
  });
})