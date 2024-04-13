/* eslint-disable */

const request = require('supertest');
const app = "http://localhost:8000";
const postTitle = 'postTitle' + Math.floor(Math.random() * 10000);
const postContent = 'postContent' + Math.floor(Math.random() * 10000);

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


describe('POST /api/v1/posts/submit/u/:subreddtnam_or_username', () => {
    
//REMOVE CREATED USER AND THEIR SETTINGS FROM DB TO BE ABLE TO TEST AGAIN
it('should create a new post on the user profile successfully', async () => {
      const post = {
        title: postTitle,
        type: "text",
        spoiler: false,
        nsfw: false,
        content: postContent,
        locked: false
      };
      const username = 'moaz';
      const response = await request(app)
                      .post(`/api/v1/posts/submit/u/${username}`)
                      .send(post)
                      .set('Authorization', `Bearer ${token}`);
      postid=response.body.data.post._id;
      expect(response.statusCode).toBe(201);
      expect(response.body.data).toHaveProperty('post');
  });
});

describe('POST /api/v1/posts/submit/r/:subreddtnam_or_username', () => {
      
  //REMOVE CREATED USER AND THEIR SETTINGS FROM DB TO BE ABLE TO TEST AGAIN
  it('should create a new post on a subreddit successfully', async () => {
        const post = {
          title: postTitle,
          type: "text",
          spoiler: false,
          nsfw: false,
          content: postContent,
          locked: false
        };
        const subreddit = 'sabaken_el_testing';
        const response = await request(app)
                        .post(`/api/v1/posts/submit/r/${subreddit}`)
                        .send(post)
                        .set('Authorization', `Bearer ${token}`);;
        expect(response.statusCode).toBe(201);
        expect(response.body.data).toHaveProperty('post');
    });
  
  it('should not create a new post on a subreddit due to subreddit not found', async () => {
    const post = {
      title: postTitle,
      type: "text",
      spoiler: false,
      nsfw: false,
      content: postContent,
      locked: false
    };
    const subreddit = 'elmod7ekfen';
    const response = await request(app)
                    .post(`/api/v1/posts/submit/r/${subreddit}`)
                    .send(post)
                    .set('Authorization', `Bearer ${token}`);;
    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty('status', 'fail');
    expect(response.body).toHaveProperty('message', 'Subreddit not found');
});


it('should not create a new post on a subreddit due to user is not authorized to post in a private subreddit', async () => {
  const post = {
    title: postTitle,
    type: "text",
    spoiler: false,
    nsfw: false,
    content: postContent,
    locked: false
  };
  const subreddit = 'elemod7eken';
  const response = await request(app)
                  .post(`/api/v1/posts/submit/r/${subreddit}`)
                  .send(post)
                  .set('Authorization', `Bearer ${token}`);;
  expect(response.statusCode).toBe(403);
  expect(response.body).toHaveProperty('status', 'fail');
  expect(response.body).toHaveProperty('message', 'You are not authorized to access this subreddit');
});
  });

describe('PATCH /api/v1/posts/:id/hide', () => {
      
  //REMOVE CREATED USER AND THEIR SETTINGS FROM DB TO BE ABLE TO TEST AGAIN
  it('should hide a post the user selected successfully', async () => {
        // const postid = '661840c8a2912d5162d8ca96';
        const response = await request(app).patch(`/api/v1/posts/${postid}/hide`).send().set('Authorization', `Bearer ${token}`);;
        expect(response.statusCode).toBe(200);
        expect(response.body.data).toHaveProperty('post');
    });

  it('should not hide a post the user selected as post doesn not exist', async () => {
    const postid = '65ff1fec2116981dac6bd5c2';
    const response = await request(app)
                    .patch(`/api/v1/posts/${postid}/hide`)
                    .set('Authorization', `Bearer ${token}`);;
    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty('status', 'fail');
    expect(response.body).toHaveProperty('message', 'No post found with that ID');
   });
  });

  describe('DELETE /api/v1/posts/:id/unhide', () => {
        
  //REMOVE CREATED USER AND THEIR SETTINGS FROM DB TO BE ABLE TO TEST AGAIN
  it('should hide a post the user selected successfully', async () => {
    // const postid = '661840c8a2912d5162d8ca96';
    const response = await request(app)
                    .delete(`/api/v1/posts/${postid}/unhide`)
                    .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.data).toHaveProperty('post');
  });
  
  it('should not hide a post the user selected as post doesn not exist', async () => {
    const postid = '65ff1fec2116981dac6bd5c2';
    const response = await request(app)
                    .delete(`/api/v1/posts/${postid}/unhide`)
                    .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty('status', 'fail');
    expect(response.body).toHaveProperty('message', 'No post found with that ID');
    });
  });

describe('GET /api/v1/posts/submit', () => {
          
  //REMOVE CREATED USER AND THEIR SETTINGS FROM DB TO BE ABLE TO TEST AGAIN
  it('should get communities and user joined communities successfully', async () => {
    const response = await request(app)
                    .get(`/api/v1/r/all`)
                    .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.data).toHaveProperty('subreddits');
  });
  })
  describe('GET /api/v1/posts/[id]/nsfw', () => {
          
    
    it('should toggle the nsfw status of the post', async () => {
      const response = await request(app)
                      .patch(`/api/v1/posts/${postid}/nsfw`)
                      .set('Authorization', `Bearer ${token}`);
      expect(response.statusCode).toBe(200);
    });
    })
    describe('GET /api/v1/posts/[id]/spoiler', () => {
          
      it('should toggle the spoiler status of the post', async () => {
        const response = await request(app)
                        .patch(`/api/v1/posts/${postid}/spoiler`)
                        .set('Authorization', `Bearer ${token}`);
        expect(response.statusCode).toBe(200);
      });
      })
      describe('GET /api/v1/posts/[id]/lock', () => {
          
        it('should toggle the lock status of the post', async () => {
          const response = await request(app)
                          .patch(`/api/v1/posts/${postid}/lock`)
                          .set('Authorization', `Bearer ${token}`);
          expect(response.statusCode).toBe(200);
        });
        })

  