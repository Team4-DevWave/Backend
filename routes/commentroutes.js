const express = require('express');
const authController = require('./../controllers/authcontroller.js');
const commentController = require('./../controllers/commentcontroller');
// eslint-disable-next-line new-cap
const commentRouter = express.Router({mergeParams: true});
commentRouter.route('/').get(commentController.getAllComments);
commentRouter.route('/:id').get(commentController.getComment);

commentRouter.use(authController.protect);
// commentRouter.use(authController.checkSubredditAccess('comment'));
// validate the user ability to comment
commentRouter
    .route('/')
    .post(commentController.createComment);
commentRouter
    .route('/:id')
    .patch(commentController.editComment)
    .delete(commentController.deleteComment);
commentRouter.post('/:id/report', commentController.reportComment);
commentRouter.patch('/:id/save', commentController.saveComment);
commentRouter.patch('/:id/vote', commentController.voteComment);

module.exports = commentRouter;
