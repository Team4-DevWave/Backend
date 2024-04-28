/* eslint-disable */

const request = require('supertest');
const app = 'http://localhost:8000';
chatroomid = "662acd41ca7ba68d522f2140";
describe('POST /api/v1/users/login', () => {
  it('should log in successfully', async () => {
    const userCredentials = {
      username: 'mariam',
      password: 'pass1234',
    };
    const response = await request(app).post('/api/v1/users/login').send(userCredentials);
    token = response.body.token;
    userId = response.body.data.user._id;
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body.data).toHaveProperty('user');
  });
});

describe('POST /api/v1/chatrooms/:chatroomid/messages', () => {
  it('should create a chat message', async () => {
    const chatMessage = {
      sender: userId,
      chatID: chatroomid,
      message: 'Hello, how are you?',
    };
    const response = await request(app)
    .post(`/api/v1/chatrooms/${chatroomid}/messages/`)
    .send(chatMessage)
    .set('Authorization', `Bearer ${token}`);
    messageid = response.body.data.chatMessage._id;
    expect(response.statusCode).toBe(201);
    expect(response.body.data).toHaveProperty('chatMessage');
  });
});

describe('GET /api/v1/chatrooms/:chatroomid/messages', () => {
  it('should get all chat messages', async () => {
    const response = await request(app)
    .get(`/api/v1/chatrooms/${chatroomid}/messages/`)
    .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.data).toHaveProperty('chatMessages');
  });
});

describe('GET /api/v1/chatmessages/:chatmessageid', () => {
  it('should get a chat message', async () => {
    const response = await request(app)
    .get(`/api/v1/chatmessages/${messageid}`)
    .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.data).toHaveProperty('chatMessage');
  });
});

describe('PATCH /api/v1/chatmessages/:chatmessageid/edit', () => {
  it('should edit a chat message', async () => {
    const chatMessage = {
      message: 'Hello, how are you doing?',
    };
    const response = await request(app).patch(`/api/v1/chatmessages/${messageid}/edit`)
    .set('Authorization', `Bearer ${token}`)
    .send(chatMessage);
    expect(response.statusCode).toBe(200);
    expect(response.body.data).toHaveProperty('chatMessage');
  });
});

describe('DELETE /api/v1/chatmessages/:chatmessageid', () => {
  it('should delete a chat message', async () => {
    const response = await request(app).delete(`/api/v1/chatmessages/${messageid}`).set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(204);
  });
});
