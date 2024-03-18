const express = require('express');
const postController = require('./../controllers/postcontroller');
const commentRouter = require('./commentroutes');
const authController = require('./../controllers/authcontroller');
// eslint-disable-next-line new-cap
const postRouter = express.Router();
postRouter.use('/:id/comments', commentRouter);

postRouter.use(authController.checkSubredditAccess('post'));

postRouter
    .route('/')
    .post(postController.createPost)
    .get(postController.getPosts);
postRouter.get('/:id', postController.getPost);
postRouter.delete('/:id/delete', postController.deletePost);
postRouter.post('/:id/vote', postController.vote);
postRouter.patch('/:id/edit', postController.editPost);
postRouter.patch('/:id/save', postController.savePost);
postRouter.patch('/:id/hide', postController.hidePost);
postRouter.patch('/:id/report', postController.reportPost);
postRouter.post('/:id/crosspost', postController.crosspost);

module.exports = postRouter;
