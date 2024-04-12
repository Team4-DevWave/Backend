/* eslint-disable */

const request = require('supertest');
const app = 'http://localhost:8000';
const postid='6617f3328ae9d1cadf035a39';

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
});
describe('POST /api/v1/posts/:postid/comments/', () => {
  it('should create a new comment including mentions', async () => {
    const commentContent={
          content: 'this is a comment test u/mohamed and u/mariam u/moaz',
        }
    const res = await request(app)
        .post(`/api/v1/posts/${postid}/comments/`)
        .set('Authorization', `Bearer ${token}`)
        .send(commentContent);
    console.log(res.body.data.comment._id);
    console.log(res.body);
    commentid=res.body.data.comment._id;
    expect(res.statusCode).toBe(201);
    expect(res.body.data).toHaveProperty('comment');
  });
});

describe('GET /api/v1/posts/:postid/comments/', () => {
  it('should get all comments of a post', async () => {
    const res = await request(app)
        .get(`/api/v1/posts/${postid}/comments/`)
        .set('Authorization', `Bearer ${token}`)
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty('comments');
  });
});
describe('PATCH /api/v1/posts/:postid/comments/:commentid/save', () => {
  it('should toggle save/unsave a comment ', async () => {
    const res = await request(app)
        .patch(`/api/v1/posts/${postid}/comments/${commentid}/save`)
        .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    // expect(res.body.data).toHaveProperty('comment');  
  });
});
describe('PATCH /api/v1/posts/:postid/comments/:commentid', () => {
  it('should edit a comment ', async () => {
    const commentContent= {content: 'this is comment edit trial u/mariam'}
    const res = await request(app)
        .patch(`/api/v1/posts/${postid}/comments/${commentid}`)
        .set('Authorization', `Bearer ${token}`)
        .send(commentContent);
    expect(res.statusCode).toEqual(200);
    expect(res.body.data).toHaveProperty('comment');
  });
});
describe('PATCH /api/v1/posts/:postid/comments/:commentid/vote', () => {
  it('should vote a comment ', async () => {
    const vote={voteType: 1};
    const res = await request(app)
        .patch(`/api/v1/posts/${postid}/comments/${commentid}/vote`)
        .set('Authorization', `Bearer ${token}`)
        .send(vote);
    expect(res.statusCode).toEqual(200);
  });
});
describe('GET /api/v1/posts/:postid/comments/:commentid', () => {
  it('should get a comment by ID', async () => {
    const res = await request(app)
        .get(`/api/v1/posts/${postid}/comments/${commentid}`)
        .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.data).toHaveProperty('comment');
  });
});
describe('DELETE /api/v1/posts/:postid/comments/:commentid', () => {
  it('should delete a comment ', async () => {
    const res = await request(app)
        .delete(`/api/v1/posts/${postid}/comments/${commentid}`)
        .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(204);
  });
});
