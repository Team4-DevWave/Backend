const express = require('express');
const authController = require('./../controllers/authcontroller.js');
const commentController = require('./../controllers/commentcontroller');
const commentRouter = express.Router({mergeParams: true});

commentRouter.use(authController.protect);

commentRouter
    .route('/')
    .post(commentController.createComment)
    .get(commentController.getComments);
commentRouter
    .route('/:id')
    .get(commentController.getComment)
    .post(commentController.addCommentReply)
    .patch(commentController.editComment)
    .delete(commentController.deleteComment);
commentRouter.route('/:id/report').post(commentController.reportComment);
commentRouter.route('/:id/save').patch(commentController.saveComment);
commentRouter.route('/:id/vote').patch(commentController.voteComment);

module.exports = commentRouter;
