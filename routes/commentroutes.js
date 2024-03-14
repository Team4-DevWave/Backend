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
    .route('/:commentid')
    .post(commentController.addCommentReply)
    .patch(commentController.editComment)
    .delete(commentController.deleteComment);
commentRouter.route('/:commentid/report').post(commentController.reportComment);
commentRouter.route('/:commentid/save').post(commentController.saveComment);
commentRouter.route('/:commentid/vote').patch(commentController.voteComment);

module.exports = commentRouter;
