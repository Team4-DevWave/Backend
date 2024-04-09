const express = require('express');
const postController = require('./../controllers/postcontroller');
const authController = require('./../controllers/authcontroller');
const commentRouter = require('./commentroutes');
// eslint-disable-next-line new-cap
const postRouter = express.Router({mergeParams: true});
postRouter.use(authController.protect);
postRouter.use('/:postid/comments', commentRouter); // NEEDS REVIEW

postRouter.post('/submit/u/:subreddit', postController.createPost);

postRouter.use('/submit/r/:subreddit', authController.checkSubredditAccess('post'));
postRouter.get('/', postController.getSubredditPosts);
postRouter.get('/:postid', postController.getPost); // TODO check this route validity
postRouter.delete('/:postid/delete', postController.deletePost);
postRouter.delete('/:postid/unhide', postController.unhidePost);
postRouter.post('/:postid/vote', postController.vote);
postRouter.patch('/:postid/edit', postController.editPost);
postRouter.patch('/:postid/save', postController.savePost);
postRouter.patch('/:postid/report', postController.reportPost);
postRouter.patch('/:postid/hide', postController.hidePost);
postRouter.get('/:postid/insights', postController.getInsights);
postRouter.post('/:postid/crosspost', postController.crosspost);
postRouter.post('/submit/r/:subreddit', postController.createPost);
postRouter.patch('/:id/save', postController.savePost);
postRouter.patch('/:id/nsfw', postController.markNSFW);
postRouter.patch('/:id/spoiler', postController.markSpoiler);
postRouter.patch('/:id/lock', postController.lockPost);

module.exports = postRouter;
