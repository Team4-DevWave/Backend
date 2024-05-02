/* eslint-disable */

const request = require('supertest');
const app = 'http://localhost:8000';
const postid='661e8e281710154e42ea63be';

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
describe('POST /api/v1/posts/:postid/comments/', () => {
  it('should create a new comment including mentions', async () => {
    const commentContent={
          content: 'this is a comment test u/theHazem and u/ismail ',
        }
    const res = await request(app)
        .post(`/api/v1/posts/${postid}/comments/`)
        .set('Authorization', `Bearer ${token}`)
        .send(commentContent);
    commentid=res.body.data.comment._id;
    expect(res.statusCode).toBe(201);
    expect(res.body.data).toHaveProperty('comment');
  });
  it('should not create a new comment without content', async () => {
    const commentContent={
          content: '',
        }
    const res = await request(app)
        .post(`/api/v1/posts/${postid}/comments/`)
        .set('Authorization', `Bearer ${token}`)
        .send(commentContent);
    expect(res.statusCode).toBe(404);
  });

  it('should not create a new comment with locked post', async () => {
    const commentContent={
          content: 'this is a comment test u/theHazem and u/ismail ',
        }
    const res = await request(app)
        .post(`/api/v1/posts/661f29f7b62959359e555a62/comments/`)
        .set('Authorization', `Bearer ${token}`)
        .send(commentContent);
    expect(res.statusCode).toBe(400);
  });
  it('should not create a new comment with wrong post id', async () => {
    const commentContent={
          content: 'this is a comment test u/theHazem and u/ismail ',
        }
    const res = await request(app)
        .post(`/api/v1/posts/661f29f7b62959359e555e11/comments/`)
        .set('Authorization', `Bearer ${token}`)
        .send(commentContent);
    expect(res.statusCode).toBe(404);
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

  it('should not get comments of a post with wrong post id', async () => {
    const res = await request(app)
        .get(`/api/v1/posts/661f29f7b62959359e555e11/comments/`)
        .set('Authorization', `Bearer ${token}`)
    expect(res.statusCode).toBe(404);
  });
});
describe('PATCH /api/v1/comments/:commentid/save', () => {
  it('should toggle save/unsave a comment ', async () => {
    const res = await request(app)
        .patch(`/api/v1/comments/${commentid}/save`)
        .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    // expect(res.body.data).toHaveProperty('comment');  
  });

  it('should not toggle save/unsave a comment with wrong comment id', async () => {
    const res = await request(app)
        .patch(`/api/v1/comments/661f29f7b62959359e555e11/save`)
        .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(404);
  });
});
describe('PATCH /api/v1/comments/:commentid', () => {
  it('should edit a comment ', async () => {
    const commentContent= {content: 'this is comment edit trial u/mariam'}
    const res = await request(app)
        .patch(`/api/v1/comments/${commentid}`)
        .set('Authorization', `Bearer ${token}`)
        .send(commentContent);
    expect(res.statusCode).toEqual(200);
    expect(res.body.data).toHaveProperty('comment');
  });
  it('should not edit a comment with wrong comment id', async () => {
    const commentContent= {content: 'this is comment edit trial u/mariam'}
    const res = await request(app)
        .patch(`/api/v1/comments/661f29f7b62959359e555e11`)
        .set('Authorization', `Bearer ${token}`)
        .send(commentContent);
    expect(res.statusCode).toBe(404);
  });
  it('should not edit a comment you do not own', async () => {
    const commentContent= {content: 'this is comment edit trial u/mariam'}
    const authResponse = await request(app)
    .post('/api/v1/users/login')
    .send({ username: 'mohamed', password:'pass1234' });
    const anotherToken = authResponse.body.token;
    const res = await request(app)
        .patch(`/api/v1/comments/${commentid}`)
        .set('Authorization', `Bearer ${anotherToken}`)
        .send(commentContent);
    expect(res.statusCode).toBe(404);
  });
});
describe('PATCH /api/v1/comments/:commentid/vote', () => {
  it('should vote a comment ', async () => {
    const vote={voteType: 1};
    const res = await request(app)
        .patch(`/api/v1/comments/${commentid}/vote`)
        .set('Authorization', `Bearer ${token}`)
        .send(vote);
    expect(res.statusCode).toEqual(200);
  });
});
describe('GET /api/v1/comments/:commentid', () => {
  it('should get a comment by ID', async () => {
    const res = await request(app)
        .get(`/api/v1/comments/${commentid}`)
        .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.data).toHaveProperty('comment');
  });
  it('should not get a comment with wrong comment id', async () => {
    const res = await request(app)
        .get(`/api/v1/comments/661f29f7b62959359e555e11`)
        .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(404);
  });
});
describe('DELETE /api/v1/comments/:commentid', () => {
  it('should delete a comment ', async () => {
    const res = await request(app)
        .delete(`/api/v1/comments/${commentid}`)
        .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(204);
  });
  it('should not delete a comment with wrong comment id', async () => {
    const res = await request(app)
        .delete(`/api/v1/comments/661f29f7b62959359e555e11`)
        .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(404);
  });
  it('should not delete a comment you do not own', async () => {
    const authResponse = await request(app)
    .post('/api/v1/users/login')
    .send({ username: 'mohamed', password:'pass1234' });
    const anotherToken = authResponse.body.token;
    const res = await request(app)
        .delete(`/api/v1/comments/${commentid}`)
        .set('Authorization', `Bearer ${anotherToken}`);
    expect(res.statusCode).toBe(404);
  });
});
