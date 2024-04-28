/* eslint-disable */

const request = require('supertest');
const app = 'http://localhost:8000';

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
});

describe('POST /api/v1/chatrooms/', () => {
  it('should create a new chatroom', async () => {
    const chatroomContent={
          chatroomName: 'chatroom test',
          chatroomMembers: ['mohamed']
        }
    const res = await request(app)
        .post(`/api/v1/chatrooms/`)
        .set('Authorization', `Bearer ${token}`)
        .send(chatroomContent);
    chatroomid=res.body.data.chatroom._id;
    expect(res.statusCode).toBe(201);
    expect(res.body.data).toHaveProperty('chatroom');
  });
});

describe('GET /api/v1/chatrooms/', () => {
  it('should get all chatrooms', async () => {
    const res = await request(app)
        .get(`/api/v1/chatrooms/`)
        .set('Authorization', `Bearer ${token}`)
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty('chatrooms');
  });
});

describe('GET /api/v1/chatrooms/:chatroomid', () => {
  it('should get a chatroom ', async () => {
    const chatroomContent= {name: 'this is chatroom edit trial'}
    const res = await request(app)
        .get(`/api/v1/chatrooms/${chatroomid}`)
        .set('Authorization', `Bearer ${token}`)
    expect(res.statusCode).toEqual(200);
  });
});

describe('PATCH /api/v1/chatrooms/:chatroomid/rename', () => {
  it('should rename a chatroom', async () => {
    const chatroomContent= {chatroomName: 'this is chatroom edit trial'}
    const res = await request(app)
        .patch(`/api/v1/chatrooms/${chatroomid}/rename`)
        .set('Authorization', `Bearer ${token}`)
        .send(chatroomContent);
    expect(res.statusCode).toEqual(200);
  });
});

describe('POST /api/v1/chatrooms/:chatroomid/addmember', () => {
  it('should add a member to a chatroom', async () => {
    const chatroomContent= {member: 'mariam'}
    const res = await request(app)
        .post(`/api/v1/chatrooms/${chatroomid}/addmember`)
        .set('Authorization', `Bearer ${token}`)
        .send(chatroomContent);
    expect(res.statusCode).toEqual(200);
  });
});

describe('DELETE /api/v1/chatrooms/:chatroomid/removemember', () => {
  it('should remove a member from a chatroom', async () => {
    const chatroomContent= {member: 'mariam'}
    const res = await request(app)
        .delete(`/api/v1/chatrooms/${chatroomid}/removemember`)
        .set('Authorization', `Bearer ${token}`)
        .send(chatroomContent);
    expect(res.statusCode).toEqual(200);
  });
});

describe('DELETE /api/v1/chatrooms/:chatroomid', () => {
  it('should delete a chatroom', async () => {
    const res = await request(app)
        .delete(`/api/v1/chatrooms/${chatroomid}`)
        .set('Authorization', `Bearer ${token}`)
    expect(res.statusCode).toEqual(204);
  });
});