/* eslint-disable */

const request = require('supertest');
const app = 'http://localhost:8000';
chatroomid = "66314952e62f1c87666419f4";
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
  it('should not create a chat message if the chatroom does not exist', async () => {
    const chatMessage = {
      message: 'Hello, how are you?',
    };
    const response = await request(app)
    .post(`/api/v1/chatrooms/66314952e62f1c87666419f3/messages/`)
    .send(chatMessage)
    .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(404);
  });
  it('should not create a chat message if the user is not a member of the chatroom', async () => {
    const chatMessage = {
      message: 'Hello, how are you?',
    };
    const authResponse = await request(app)
    .post('/api/v1/users/login')
    .send({ username: 'mohamed', password:'pass1234' });
  const nonMemberToken = authResponse.body.token;
    const response = await request(app)
    .post(`/api/v1/chatrooms/${chatroomid}/messages/`)
    .send(chatMessage)
    .set('Authorization', `Bearer ${nonMemberToken}`);
    expect(response.statusCode).toBe(401);
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
  it('should not get all chat messages if the chatroom does not exist', async () => {
    const response = await request(app)
    .get(`/api/v1/chatrooms/66314952e62f1c87666419f3/messages/`)
    .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(404);
  });
  it('should not get all chat messages if the user is not a member of the chatroom', async () => {
    const authResponse = await request(app)
    .post('/api/v1/users/login')
    .send({ username: 'mohamed', password:'pass1234' });
  const nonMemberToken = authResponse.body.token;
    const response = await request(app)
    .get(`/api/v1/chatrooms/${chatroomid}/messages/`)
    .set('Authorization', `Bearer ${nonMemberToken}`);
    expect(response.statusCode).toBe(401);
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
  it('should not get a chat message if the chat message does not exist', async () => {
    const response = await request(app)
    .get(`/api/v1/chatmessages/66314952e62f1c87666419f3`)
    .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(404);
  });
  it('should not get a chat message if the user is not a member of the chatroom', async () => {
    const authResponse = await request(app)
    .post('/api/v1/users/login')
    .send({ username: 'mohamed', password:'pass1234' });
  const nonMemberToken = authResponse.body.token;
    const response = await request(app)
    .get(`/api/v1/chatmessages/${messageid}`)
    .set('Authorization', `Bearer ${nonMemberToken}`);
    expect(response.statusCode).toBe(401);
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
  it('should not edit a chat message if the chat message does not exist', async () => {
    const chatMessage = {
      message: 'Hello, how are you doing?',
    };
    const response = await request(app).patch(`/api/v1/chatmessages/66314952e62f1c87666419f3/edit`)
    .set('Authorization', `Bearer ${token}`)
    .send(chatMessage);
    expect(response.statusCode).toBe(404);
  });
});

describe('DELETE /api/v1/chatmessages/:chatmessageid', () => {
  it('should not delete a chat message if the user is not a member of the chatroom', async () => {
    const authResponse = await request(app)
    .post('/api/v1/users/login')
    .send({ username: 'mohamed', password:'pass1234' });
  const nonMemberToken = authResponse.body.token;
    const response = await request(app).delete(`/api/v1/chatmessages/${messageid}`).set('Authorization', `Bearer ${nonMemberToken}`);
    expect(response.statusCode).toBe(401);
  });
  it('should delete a chat message', async () => {
    const response = await request(app).delete(`/api/v1/chatmessages/${messageid}`).set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(204);
  });
    it('should not delete a chat message if the chat message does not exist', async () => {
    const response = await request(app).delete(`/api/v1/chatmessages/66314952e62f1c87666419f3`).set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(404);
  });
  
});
