/* eslint-disable */

const request = require('supertest');
const app = 'http://localhost:8000';

describe('POST /api/v1/users/login', () => {
  it('should log in successfully', async () => {
    const userCredentials = {
      username: 'mariam',
      password: 'pass1234',
    };
    const res = await request(app).post('/api/v1/users/login')
        .send(userCredentials);
    token = res.body.token;
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.data).toHaveProperty('user');
  });
});
describe('POST /api/v1/messages/compose', () => {
  it('should create a new message', async () => {
    const messageData = {
      from: '',
      to: 'u/ismail',
      subject: 'message composed',
      message: 'hello from the other world ',
    };
    const res = await request(app)
        .post('/api/v1/messages/compose')
        .set('Authorization', `Bearer ${token}`)
        .send(messageData);
    messageid=res.body.data.message._id;
    expect(res.statusCode).toBe(201);
    expect(res.body.data).toHaveProperty('message');
  });
  it('you cannot send a message using other users name', async () => {
    const messageData = {
      from: 'u/mohamed',
      to: 'u/theHazem',
      subject: 'message composed',
      message: 'hello from the other world ',
    };
    const res = await request(app)
        .post('/api/v1/messages/compose')
        .set('Authorization', `Bearer ${token}`)
        .send(messageData);
    expect(res.statusCode).toBe(400);
  });
  it('you cannot send a message using other subreddits name if you\'re not a member', async () => {
    const messageData = {
      from: 'r/mimiworld',
      to: 'u/theHazem',
      subject: 'message composed',
      message: 'hello from the other world ',
    };
    const res = await request(app)
        .post('/api/v1/messages/compose')
        .set('Authorization', `Bearer ${token}`)
        .send(messageData);
    expect(res.statusCode).toBe(400);
  });
  it('you cannot send a message using other subreddits name if you\'re not a moderator', async () => {
    const messageData = {
      from: 'r/mimiworld',
      to: 'u/theHazem',
      subject: 'message composed',
      message: 'hello from the other world ',
    };
    const res = await request(app)
        .post('/api/v1/messages/compose')
        .set('Authorization', `Bearer ${token}`)
        .send(messageData);
    expect(res.statusCode).toBe(400);
  });
});
  describe('GET /api/v1/messages/inbox', () => {
    it('should get all inbox messages', async () => {
      const res = await request(app)
      .get('/api/v1/messages/inbox')
      .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveProperty('messages');
    });

  });
  describe('GET /api/v1/messages/sent', () => {
    it('should get all sent messages', async () => {
      const res = await request(app)
      .get('/api/v1/messages/sent')
      .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveProperty('messages');
    });
  });
describe('GET /api/v1/messages/unread', () => {
  it('should get all unread messages', async () => {
    const res = await request(app)
    .get('/api/v1/messages/unread')
    .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty('messages');
  });
});
describe('GET /api/v1/messages/postreply', () => {
  it('should get all post reply messages', async () => {
    const res = await request(app)
    .get('/api/v1/messages/postreply')
    .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty('messages');
  });
});
describe('GET /api/v1/messages/mentions', () => {
  it('should get all mentioned messages', async () => {
    const res = await request(app)
    .get('/api/v1/messages/mentions')
    .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty('messages');
  });
});
describe('PATCH /api/v1/messages/markallread', () => {
  it('should mark all messages as read', async () => {
    const res = await request(app)
    .patch('/api/v1/messages/markallread')
    .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });
});
describe('GET /api/v1/messages/:id', () => {
  it('should get a message', async () => {
    // const id='6608b0ce956f80a60f484f75';
    const res = await request(app)
    .get(`/api/v1/messages/${messageid}`)
    .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });
  it('should not get a message if it does not exist', async () => {
    const res = await request(app)
    .get('/api/v1/messages/661dadfa8a8e750d4c3f2abc')
    .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(404);
  });
  it('should not get a message if it does not belong to the user', async () => {
    const res = await request(app)
    .get('/api/v1/messages/661dadfa8a8e750d4c3f2fff')
    .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(404);
  });
});
describe('PATCH /api/v1/messages/:id/markread', () => {
  it('should mark a message as read', async () => {
    // const id=0;
    const res = await request(app)
    .patch(`/api/v1/messages/${messageid}/markread`)
    .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });
});
describe('DELETE /api/v1/messages/:id/delete', () => {
  it('should delete a message', async () => {
    const res = await request(app)
    .delete(`/api/v1/messages/${messageid}/delete`)
    .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(204);
  });
  it('should not delete a message if it does not exist', async () => {
    const res = await request(app)
    .delete(`/api/v1/messages/${messageid}/delete`)
    .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(404);
  });
  it('should not delete a message if it does not belong to the user', async () => {
    const res = await request(app)
    .delete('/api/v1/messages/661dadfa8a8e750d4c3f2fff/delete')
    .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(404);
  });
});

