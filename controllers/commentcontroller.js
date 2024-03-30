const commentModel = require('../models/commentsmodel');
const AppError = require('../utils/apperror');
const catchAsync = require('../utils/catchasync');
const handlerFactory = require('./handlerfactory');
const messageModel=require('../models/messagesmodel');
const userModel = require('../models/usermodel');
const postModel = require('../models/postmodel');

exports.getComment=catchAsync(async (req, res, next) => {
  const comment = await commentModel.findById(req.params.id);
  if (!comment) {
    return next(new AppError('no comment with that id', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      comment: comment,
    },
  });
});

const createMessage = catchAsync(async (comment) => {
  // Send a message to each mentioned user
  if (comment.mentioned && comment.mentioned.length > 0) {
    comment.mentioned.forEach(async (userId) => {
      // If the user is the one who created the comment, skip sending the message
      if (userId.toString() === comment.user.toString()) {
        return;
      }
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
  if (comment.user.toString() !== post.userID.toString()) {
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
// CREATING A MESSAGE NOT TESTED YET IN CREATE AND EDIT COMMENT
exports.createComment =catchAsync(async (req, res, next) => {
  if (!req.params.id) {
    return next(new AppError('no post id found', 404));
  }
  if (!req.body.content) {
    return next(new AppError('no content found', 404));
  }
  const comment = await commentModel.create({
    post: req.params.id,
    user: req.user.id,
    content: req.body.content,
    mentioned: await handlerFactory.checkMentions(userModel, req.body.content),
  });
  createMessage(comment);
  res.status(201).json({
    status: 'success',
    data: {
      comment: comment,
    },
  });
});
// TRY SEND MESSAGE TO NEWLY MENTIONED USERS IF COMMENT EDITED
exports.editComment = catchAsync(async (req, res, next) => {
  const comment = await commentModel.findById(req.params.id);
  if (!comment) {
    return next(new AppError('no comment with that id', 404));
  }
  if (comment.user != req.user.id) {
    return next(new AppError('you are not allowed to edit this comment', 403));
  }
  const oldMentions = comment.mentioned;
  comment.content = req.body.content;
  comment.lastEdited = Date.now();
  comment.mentioned = await handlerFactory.checkMentions(userModel, req.body.content);
  await comment.save();
  // Check for new mentions
  const newMentions = comment.mentioned.filter((mention) => !oldMentions.includes(mention));
  if (newMentions.length > 0) {
    newMentions.forEach((user) => {
      createMessage(comment);
    });
  }
  res.status(200).json({
    status: 'success',
    data: {
      comment: comment,
    },
  });
});

exports.deleteComment = catchAsync(async (req, res, next) => {
  const comment = await commentModel.findByIdAndDelete(req.params.id);
  if (!comment) {
    return next(new AppError('no comment with that id', 404));
  }
  if (comment.user != req.user.id) {
    return next(new AppError('you are not allowed to delete this comment', 403));
  }
  // await comment.remove();
  res.status(204).json({
    status: 'success',
    // data: null,
  });
});

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
    // data: {
    //   comment: comment,
    // },
  });
});

// not implemented yet waiting for moderation
exports.reportComment = catchAsync(async (req, res, next) => {});

exports.voteComment = handlerFactory.voteOne(commentModel, 'comments');


