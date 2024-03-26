const express = require('express');
const postController = require('./../controllers/postcontroller');
const homepageController = require('./../controllers/homepagecontroller');
const commentRouter = require('./commentroutes');
const authController = require('./../controllers/authcontroller');
// eslint-disable-next-line new-cap
const postRouter = express.Router();

postRouter.use(authController.protect);

postRouter
    .route('/submit/u/:subreddit').post(postController.createPost);


postRouter.use('/:id/comments', commentRouter);

postRouter.use('/submit/r/:subreddit', authController.checkSubredditAccess('post'));

postRouter
    .route('/')
    .get(postController.getPosts);
postRouter.get('/:id', postController.getPost);
postRouter.delete('/:id/delete', postController.deletePost);
postRouter.delete('/:id/unhide', postController.unhidePost);
postRouter.post('/:id/vote', postController.vote);
postRouter.patch('/:id/edit', postController.editPost);
postRouter.patch('/:id/save', postController.savePost);
postRouter.patch('/:id/report', postController.reportPost);
postRouter.patch('/:id/hide', postController.hidePost);
postRouter.post('/:id/crosspost', postController.crosspost);

postRouter
    .route('/submit').get(homepageController.getCommunities);

postRouter
    .route('/submit/r/:subreddit').post(postController.createPost);


module.exports = postRouter;
