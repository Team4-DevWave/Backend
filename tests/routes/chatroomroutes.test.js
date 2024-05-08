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
          chatroomMembers: ['mohamed','moashraf']
        }
    const res = await request(app)
        .post(`/api/v1/chatrooms/`)
        .set('Authorization', `Bearer ${token}`)
        .send(chatroomContent);
    chatroomid=res.body.data.chatroom._id;
    expect(res.statusCode).toBe(201);
    expect(res.body.data).toHaveProperty('chatroom');
  });
  it('should not create a new chatroom as there are no members', async () => {
    const chatroomContent={
          chatroomMembers: []
        }
    const res = await request(app)
        .post(`/api/v1/chatrooms/`)
        .set('Authorization', `Bearer ${token}`)
        .send(chatroomContent);
    expect(res.statusCode).toBe(400);
  });
  it('should not create a new chatroom as a member doesnt exist', async () => {
    const chatroomContent={
          chatroomMembers: ['unknown']
        }
    const res = await request(app)
        .post(`/api/v1/chatrooms/`)
        .set('Authorization', `Bearer ${token}`)
        .send(chatroomContent);
    expect(res.statusCode).toBe(400);
  });
  it('should not create a new chatroom as a direct message chatroom already exists', async () => {
    const chatroomContent={
          chatroomMembers: ['theHazem']
        }
    const res = await request(app)
        .post(`/api/v1/chatrooms/`)
        .set('Authorization', `Bearer ${token}`)
        .send(chatroomContent);
    expect(res.statusCode).toBe(400);
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
  it('should not get a chatroom as it does not exist', async () => {
    const res = await request(app)
        .get(`/api/v1/chatrooms/66314952e62f1c87666419f3`)
        .set('Authorization', `Bearer ${token}`)
    expect(res.statusCode).toEqual(404);
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
  it('should not rename a chatroom as it does not exist', async () => {
    const chatroomContent= {chatroomName: 'this is chatroom edit trial'}
    const res = await request(app)
        .patch(`/api/v1/chatrooms/66314952e62f1c87666419f3/rename`)
        .set('Authorization', `Bearer ${token}`)
        .send(chatroomContent);
    expect(res.statusCode).toEqual(404);
  });
});

describe('POST /api/v1/chatrooms/:chatroomid/addmember', () => {
  it('should add a member to a chatroom', async () => {
    const chatroomContent= {member: 'WorldEnder'}
    const res = await request(app)
        .post(`/api/v1/chatrooms/${chatroomid}/addmember`)
        .set('Authorization', `Bearer ${token}`)
        .send(chatroomContent);
    expect(res.statusCode).toEqual(200);
  });

  it('should not add a member to a chatroom as the chatroom does not exist', async () => {
    const chatroomContent= {member: 'mohamed'}
    const res = await request(app)
        .post(`/api/v1/chatrooms/66314952e62f1c87666419f3/addmember`)
        .set('Authorization', `Bearer ${token}`)
        .send(chatroomContent);
    expect(res.statusCode).toEqual(404);
  });

  it('should not add admin as a new member', async () => {
    const chatroomContent= {member: 'mariam'}
    const res = await request(app)
        .post(`/api/v1/chatrooms/${chatroomid}/addmember`)
        .set('Authorization', `Bearer ${token}`)
        .send(chatroomContent);
    expect(res.statusCode).toEqual(400);
  });
  it('should not add a member to a chatroom as the member does not exist', async () => {
    const chatroomContent= {member: 'unknown'}
    const res = await request(app)
        .post(`/api/v1/chatrooms/${chatroomid}/addmember`)
        .set('Authorization', `Bearer ${token}`)
        .send(chatroomContent);
    expect(res.statusCode).toEqual(400);
  });
});

describe('DELETE /api/v1/chatrooms/:chatroomid/removemember', () => {
  it('should remove a member from a chatroom', async () => {
    const chatroomContent= {member: 'mohamed'}
    const res = await request(app)
        .delete(`/api/v1/chatrooms/${chatroomid}/removemember`)
        .set('Authorization', `Bearer ${token}`)
        .send(chatroomContent);
    expect(res.statusCode).toEqual(200);
  });
  it('should not remove a member from a chatroom as the chatroom does not exist', async () => {
    const chatroomContent= {member: 'mohamed'}
    const res = await request(app)
        .delete(`/api/v1/chatrooms/66314952e62f1c87666419f3/removemember`)
        .set('Authorization', `Bearer ${token}`)
        .send(chatroomContent);
    expect(res.statusCode).toEqual(404);
  });
  it('should not remove a member from a chatroom as the member does not exist', async () => {
    const chatroomContent= {member: 'unknown'}
    const res = await request(app)
        .delete(`/api/v1/chatrooms/${chatroomid}/removemember`)
        .set('Authorization', `Bearer ${token}`)
        .send(chatroomContent);
    expect(res.statusCode).toEqual(400);
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

describe('DELETE /api/v1/chatrooms/:chatroomid/leave', () => {
  it('should leave a chatroom', async () => {
    const chatroomContent={
          chatroomName: 'chatroom test',
          chatroomMembers: ['WorldEnder','TarekEmad']
        }
    const createResponse = await request(app)
        .post(`/api/v1/chatrooms/`)
        .set('Authorization', `Bearer ${token}`)
        .send(chatroomContent);
    chatroomidleave=createResponse.body.data.chatroom._id;
    const leaveResponse = await request(app)
        .delete(`/api/v1/chatrooms/${chatroomidleave}/leave`)
        .set('Authorization', `Bearer ${token}`)
        expect(leaveResponse.statusCode).toEqual(204);
    const deleteResponse = await request(app)
        .delete(`/api/v1/chatrooms/${chatroomidleave}`)
        .set('Authorization', `Bearer ${token}`)
        expect(deleteResponse.statusCode).toEqual(204);
  });
  it('should not leave a chatroom as the chatroom does not exist', async () => {
    const res = await request(app)
        .delete(`/api/v1/chatrooms/66314952e62f1c87666419f3/leave`)
        .set('Authorization', `Bearer ${token}`)
    expect(res.statusCode).toEqual(404);
  });
});