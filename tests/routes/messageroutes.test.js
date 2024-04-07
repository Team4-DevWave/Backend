/* eslint-disable */

const request = require('supertest');
const app = 'http://localhost:8000';

describe('POST /api/v1/users/login', () => {
  it('should log in successfully', async () => {
    const userCredentials = {
      username: 'moaz',
      email: 'moaz123@yopmail.com',
      password: 'pass1234',
    };
    const response = await request(app).post('/api/v1/users/login')
        .send(userCredentials);
    token = response.body.token;
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body.data).toHaveProperty('user');
  });
});
describe('POST /api/v1/messages/compose', () => {
  it('should create a new message', async () => {
    const messageData = {
      from: '',
      to: 'mariam',
      subject: 'message composed',
      message: 'hello from the other world ',
    };
    const response = await request(app)
        .post('/api/v1/messages/compose')
        .send(messageData);
    expect(response.statusCode).toBe(200);
  });
  describe('GET /api/v1/messages/inbox', () => {
    it('should get all inbox messages', async () => {
      const response = await request(app).get('/api/v1/messages/inbox');
      expect(response.statusCode).toBe(200);
      expect(response.data).toHaveProperty('messages');
    });
  });
  describe('GET /api/v1/messages/sent', () => {
    it('should get all sent messages', async () => {
      const response = await request(app).get('/api/v1/messages/sent');

      expect(response.statusCode).toBe(200);
      expect(response.data).toHaveProperty('messages');
    });
  });
});
describe('GET /api/v1/messages/unread', () => {
  it('should get all unread messages', async () => {
    const response = await request(app).get('/api/v1/messages/unread');
    expect(response.statusCode).toBe(200);
    expect(response.data).toHaveProperty('messages');
  });
});
describe('GET /api/v1/messages/postreply', () => {
  it('should get all post reply messages', async () => {
    const response = await request(app).get('/api/v1/messages/postreply');
    expect(response.statusCode).toBe(200);
    expect(response.data).toHaveProperty('messages');
  });
});
describe('GET /api/v1/messages/mentions', () => {
  it('should get all mentioned messages', async () => {
    const response = await request(app).get('/api/v1/messages/mentions');
    expect(response.statusCode).toBe(200);
    expect(response.data).toHaveProperty('messages');
  });
});
describe('PATCH /api/v1/messages/markallread', () => {
  it('should mark all messages as read', async () => {
    const response = await request(app).patch('/api/v1/messages/markallread');
    expect(response.statusCode).toBe(200);
  });
});
describe('GET /api/v1/messages/:id', () => {
  it('should get a message', async () => {
    const id='6608b0ce956f80a60f484f75';
    const response = await request(app).get(`/api/v1/messages/${id}`);
    expect(response.statusCode).toBe(200);
  });
});
describe('PATCH /api/v1/messages/:id/markread', () => {
  it('should mark a message as read', async () => {
    const id=0;
    const response = await request(app).patch(`/api/v1/messages/${id}/markread`);
    expect(response.statusCode).toBe(200);
  });
});
describe('DELETE /api/v1/messages/:id/delete', () => {
  it('should delete a message', async () => {
    const id=0;
    const response = await request(app).delete(`/api/v1/messages/${id}/delete`);
    expect(response.statusCode).toBe(204);
  });
});

// TO DO AFTER MODERATION
// describe('DELETE /api/v1/messages/:id/report', () => {
//   it('should report a message', async () => {
//     const id=0;
//     const response = await request(app).post(`/api/v1/messages/${id}/report`);

//     expect(response.statusCode).toBe(200);
//     // Add more assertions to validate the response body or other conditions
//   });

//   // Add more test cases for other message routes
// });
