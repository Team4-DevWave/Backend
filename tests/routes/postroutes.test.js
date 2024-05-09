/* eslint-disable */

const request = require('supertest');
const app = "http://localhost:8000";
const postTitle = 'postTitle' + Math.floor(Math.random() * 10000);
const postContent = 'postContent' + Math.floor(Math.random() * 10000);
const userController = require('../../controllers/usercontroller');
const commentcontroller = require('../../controllers/commentcontroller');
const postcontroller = require('../../controllers/postcontroller');
const subredditcontroller = require('../../controllers/subredditcontroller');
const notificationcontroller = require('../../controllers/notificationcontroller');
const errorcontroller = require('../../controllers/errorcontroller');
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
      usertextpostid=response.body.data.post._id;
      expect(response.statusCode).toBe(201);
      expect(response.body.data).toHaveProperty('post');
  });

it('should create a new post with image on the user profile successfully', async () => {
  const post = {
    title: postTitle,
    type: "image/video",
    spoiler: true,
    nsfw: false,
    locked: false,
    text_body: "feel free to open the link in response -.-",
    video: "",
    image: "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"
    };
  const username = 'moaz';
  const response = await request(app).post(`/api/v1/posts/submit/u/${username}`).send(post).set('Authorization', `Bearer ${token}`);
  userimagepostid=response.body.data.post._id;
  expect(response.statusCode).toBe(201);
  expect(response.body.data).toHaveProperty('post');
});

it('should create a new post with url on the user profile successfully', async () => {
  const post = {
    title: postTitle,
    type: "url",
    spoiler: true,
    nsfw: false,
    locked: false,
    text_body: "feel free to open the link in response -.-",
    url: "https://www.google.com"
    };
  const username = 'moaz';
  const response = await request(app).post(`/api/v1/posts/submit/u/${username}`).send(post).set('Authorization', `Bearer ${token}`);
  userurlpostid=response.body.data.post._id;
  expect(response.statusCode).toBe(201);
  expect(response.body.data).toHaveProperty('post');
});

it('should create a new post with poll on the user profile successfully', async () => {
  const post = {
    title: postTitle,
    type: "poll",
    spoiler: true,
    nsfw: false,
    locked: false,
    text_body: "feel free to open the link in response -.-",
    poll: {
      "option1": [],
      "option2": [],
      "option3": [],
      "option4": []
    }
  };
  const username = 'moaz';
  const response = await request(app).post(`/api/v1/posts/submit/u/${username}`).send(post).set('Authorization', `Bearer ${token}`);
  userpollpostid=response.body.data.post._id;
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
        const subreddit = 'rainbow';
        const response = await request(app)
                        .post(`/api/v1/posts/submit/r/${subreddit}`)
                        .send(post)
                        .set('Authorization', `Bearer ${token}`);
        subreddittextpostid=response.body.data.post._id;
        expect(response.statusCode).toBe(201);
        expect(response.body.data).toHaveProperty('post');
    });

    it('should create a new post with image on a subreddit successfully', async () => {
      const post = {
        title: postTitle,
        type: "image/video",
        spoiler: true,
        nsfw: false,
        locked: false,
        text_body: "feel free to open the link in response -.-",
        video: "",
        image: "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"
        };
      const subreddit = 'rainbow';
      const response = await request(app)
                      .post(`/api/v1/posts/submit/r/${subreddit}`)
                      .send(post)
                      .set('Authorization', `Bearer ${token}`);
      subredditimagepostid=response.body.data.post._id;
      expect(response.statusCode).toBe(201);
      expect(response.body.data).toHaveProperty('post');
    }, 20000);
    
    it('should create a new post with url on a subreddit successfully', async () => {
      const post = {
        title: postTitle,
        type: "url",
        spoiler: true,
        nsfw: false,
        locked: false,
        text_body: "feel free to open the link in response -.-",
        url: "https://www.google.com"
        };
      const subreddit = 'rainbow';
      const response = await request(app)
                      .post(`/api/v1/posts/submit/r/${subreddit}`)
                      .send(post)
                      .set('Authorization', `Bearer ${token}`);
      subredditurlpostid=response.body.data.post._id;
      expect(response.statusCode).toBe(201);
      expect(response.body.data).toHaveProperty('post');
    });
    
    it('should create a new post with poll on a subreddit successfully', async () => {
      const post = {
        title: postTitle,
        type: "poll",
        spoiler: true,
        nsfw: false,
        locked: false,
        text_body: "feel free to open the link in response -.-",
        poll: {
          "option1": [],
          "option2": [],
          "option3": [],
          "option4": []
        }
      };
      const subreddit = 'rainbow';
      const response = await request(app)
                        .post(`/api/v1/posts/submit/r/${subreddit}`)
                        .send(post)
                        .set('Authorization', `Bearer ${token}`);
      subredditpollpostid=response.body.data.post._id;
      expect(response.statusCode).toBe(201);
      expect(response.body.data).toHaveProperty('post');
    },20000);
  
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
  const subreddit = 'private community';
  const response = await request(app)
                  .post(`/api/v1/posts/submit/r/${subreddit}`)
                  .send(post)
                  .set('Authorization', `Bearer ${token}`);;
  expect(response.statusCode).toBe(403);
  expect(response.body).toHaveProperty('status', 'fail');
  expect(response.body).toHaveProperty('message', 'You are not authorized to access this subreddit');
});
  });

describe('post /api/v1/posts/:id/hide', () => {
      
  //REMOVE CREATED USER AND THEIR SETTINGS FROM DB TO BE ABLE TO TEST AGAIN
  it('should hide a post the user selected successfully', async () => {
        const response = await request(app).post(`/api/v1/posts/${usertextpostid}/hide`).send().set('Authorization', `Bearer ${token}`);;
        expect(response.statusCode).toBe(200);
    });

  it('should not hide a post the user selected as post doesnt exist', async () => {
    const postid = '65ff1fec2116981dac6bd4c1';
    const response = await request(app)
                    .post(`/api/v1/posts/${postid}/hide`)
                    .set('Authorization', `Bearer ${token}`);;
    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty('status', 'fail');
    expect(response.body).toHaveProperty('message', 'No post found with that ID');
   });
  });

  describe('DELETE /api/v1/posts/:id/unhide', () => {
        
  //REMOVE CREATED USER AND THEIR SETTINGS FROM DB TO BE ABLE TO TEST AGAIN
  it('should hide a post the user selected successfully', async () => {
    const response = await request(app)
                    .delete(`/api/v1/posts/${usertextpostid}/unhide`)
                    .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
  });
  
  it('should not hide a post the user selected as post doesn not exist', async () => {
    const postid = '65ff1fec2116981dac6bd5c2';
    const response = await request(app)
                    .delete(`/api/v1/posts/${postid}/unhide`)
                    .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(404);
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
                      .patch(`/api/v1/posts/${usertextpostid}/nsfw`)
                      .set('Authorization', `Bearer ${token}`);
      expect(response.statusCode).toBe(200);
    });
    })
    describe('GET /api/v1/posts/[id]/spoiler', () => {
          
      it('should toggle the spoiler status of the post', async () => {
        const response = await request(app)
                        .patch(`/api/v1/posts/${usertextpostid}/spoiler`)
                        .set('Authorization', `Bearer ${token}`);
        expect(response.statusCode).toBe(200);
      });
      })
      describe('GET /api/v1/posts/[id]/lock', () => {
          
        it('should toggle the lock status of the post', async () => {
          const response = await request(app)
                          .patch(`/api/v1/posts/${usertextpostid}/lock`)
                          .set('Authorization', `Bearer ${token}`);
          expect(response.statusCode).toBe(200);
        });
        })

describe('DELETE /api/v1/posts/:id', () => {
          
  //REMOVE CREATED USER AND THEIR SETTINGS FROM DB TO BE ABLE TO TEST AGAIN
  it('should delete a user text post the user selected successfully', async () => {
    const response = await request(app)
                    .delete(`/api/v1/posts/${usertextpostid}/delete`)
                    .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(204);
  });
    it('should delete a user image post the user selected successfully', async () => {
    const response = await request(app)
                    .delete(`/api/v1/posts/${userimagepostid}/delete`)
                    .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(204);
  });
    it('should delete a user url post the user selected successfully', async () => {
    const response = await request(app)
                    .delete(`/api/v1/posts/${userurlpostid}/delete`)
                    .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(204);
  });
    it('should delete a user poll post the user selected successfully', async () => {
    const response = await request(app)
                    .delete(`/api/v1/posts/${userpollpostid}/delete`)
                    .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(204);
  });
    it('should delete a subreddit text post the user selected successfully', async () => {
    const response = await request(app)
                    .delete(`/api/v1/posts/${subreddittextpostid}/delete`)
                    .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(204);
  });
    it('should delete a subreddit image post the user selected successfully', async () => {
    const response = await request(app)
                    .delete(`/api/v1/posts/${subredditimagepostid}/delete`)
                    .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(204);
  });
    it('should delete a subreddit url post the user selected successfully', async () => {
    const response = await request(app)
                    .delete(`/api/v1/posts/${subredditurlpostid}/delete`)
                    .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(204);
  });
      it('should delete a subreddit poll post the user selected successfully', async () => {
    const response = await request(app)
                    .delete(`/api/v1/posts/${subredditpollpostid}/delete`)
                    .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(204);
  });
  });