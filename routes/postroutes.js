const express = require('express');
const postController = require('./../controllers/postcontroller');
const authController = require('./../controllers/authcontroller');
const commentRouter = require('./commentroutes');
// eslint-disable-next-line new-cap
const postRouter = express.Router();
postRouter.use(authController.protect);
postRouter.use('/:id/comments', commentRouter); // NEEDS REVIEW

postRouter.post('/submit/u/:subreddit', postController.createPost);

postRouter.use('/submit/r/:subreddit', authController.checkSubredditAccess('post'));

postRouter.get('/:id', postController.getPost); // TODO check this route validity
postRouter.delete('/:id/delete', postController.deletePost);
postRouter.delete('/:id/unhide', postController.unhidePost);
postRouter.post('/:id/vote', postController.vote);
postRouter.patch('/:id/edit', postController.editPost);
postRouter.patch('/:id/save', postController.savePost);
postRouter.patch('/:id/report', postController.reportPost);
postRouter.patch('/:id/hide', postController.hidePost);
postRouter.get('/:id/insights', postController.getInsights);
postRouter.post('/:id/crosspost', postController.crosspost);
postRouter.post('/submit/r/:subreddit', postController.createPost);

module.exports = postRouter;
