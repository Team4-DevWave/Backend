const commentModel = require('../models/commentsmodel');
const AppError = require('../utils/apperror');
const catchAsync = require('../utils/catchasync');
const handlerFactory = require('./handlerfactory');
const messageModel=require('../models/messagesmodel');
const userModel = require('../models/usermodel');
const postModel = require('../models/postmodel');

exports.getComment = handlerFactory.getOne(commentModel);
exports.createComment = handlerFactory.createOne(commentModel, async (req) => {
  req.body.post = req.params.id;
  req.body.user = req.user.id;
  req.body.mentioned=await handlerFactory.checkMentions(userModel, req.body.content);
  return req.body;
});
exports.editComment = handlerFactory.updateOne(commentModel, async (req) => {
  req.body.lastEdited = Date.now();
  req.body.mentioned= await handlerFactory.checkMentions(userModel, req.body.content);
  return req.body;
});
exports.deleteComment = handlerFactory.deleteOne(commentModel);
exports.saveComment = catchAsync(async (req, res, next) => {
  const comment= await commentModel.findById(req.params.id);
  if (!comment) {
    return next(new AppError('no comment with that id', 404));
  }
  comment.saved = !comment.saved;
  await comment.save();
  const update= comment.saved ?
    {$addToSet: {'savedPostsAndComments.comments': req.params.id}} :
    {$pull: {'savedPostsAndComments.comments': req.params.id}};
  await userModel.findByIdAndUpdate(req.user.id, update, {new: true});
  res.status(200).json({
    status: 'success',
    data: {
      comment: comment,
    },
  });
});

// not implemented yet waiting for moderation
exports.reportComment = catchAsync(async (req, res, next) => {});

exports.voteComment = handlerFactory.voteOne(commentModel, 'comments');

exports.createMessage = catchAsync(async (comment) => {
  // Send a message to each mentioned user
  if (comment.mentioned && comment.mentioned.length > 0) {
    comment.mentioned.forEach(async (userId) => {
      const user = await userModel.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }
      await messageModel.create({
        from: comment.user,
        to: userId,
        subject: 'username mention',
        comment: comment._id,
        message: comment.content,
        post: comment.post,
      });
    });
  }
  // Send a message to the post owner
  const post = await postModel.findById(comment.post);
  if (!post) {
    throw new AppError('Post not found', 404);
  }
  // Check if the comment's user is not the post's owner
  if (comment.user !== post.userID) {
    await messageModel.create({
      from: comment.user,
      to: post.userID,
      subject: 'post reply',
      comment: comment._id,
      message: comment.content,
      post: comment.post,
    });
  }
});
