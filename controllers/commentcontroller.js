const commentModel = require('../models/commentsmodel');
const AppError = require('../utils/apperror');
const catchAsync = require('../utils/catchasync');
const handlerFactory = require('./handlerfactory');
const messageModel=require('../models/messagesmodel');
const userModel = require('../models/usermodel');
const postModel = require('../models/postmodel');
const paginate = require('../utils/paginate');
const notificationController = require('./notificationcontroller');
const settingsModel = require('../models/settingsmodel');
const commentUtil = require('../utils/commentutil');
const postutil = require('../utils/postutil');

exports.getComment=catchAsync(async (req, res, next) => {
  const comment = await commentModel.findById(req.params.id);
  if (!comment) {
    return next(new AppError('no comment with that id', 404));
  }
  const alteredComment = await commentUtil.alterComments(req, [comment]);
  res.status(200).json({
    status: 'success',
    data: {
      comment: alteredComment[0],
    },
  });
});

exports.getAllComments = catchAsync(async (req, res, next) => {
  const pageNumber = req.query.page || 1;
  const comments = paginate.paginate(await commentModel.find({post: req.params.postid}), 10, pageNumber);
  if (req.params.postid) {
    const post = await postModel.findById(req.params.postid);
    if (!post) {
      return next(new AppError('no post with that id', 404));
    }
  }
  const alteredComments = await commentUtil.alterComments(req, comments);
  res.status(200).json({
    status: 'success',
    results: alteredComments.length,
    data: {
      comments: alteredComments,
    },
  });
});

const createMessage = catchAsync(async (req, comment) => {
  const post = await postModel.findById(comment.post);
  if (!post) {
    throw new AppError('Post not found', 404);
  }
  // Send a message to each mentioned user
  const user = await userModel.findById(comment.user);
  const username = user.username;
  const alteredPosts = await postutil.alterPosts(req, [post]);
  if (comment.mentioned && comment.mentioned.length > 0) {
    comment.mentioned.forEach(async (userId) => {
      // If the user is the one who created the comment, skip sending the message
      if (userId.toString() === comment.user.id) {
        return;
      }
      const user = await userModel.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }
      await messageModel.create({
        from: comment.user._id,
        fromType: 'users',
        to: userId,
        toType: 'users',
        subject: 'username mention: '+ post.title,
        comment: comment._id,
        message: comment.content,
        post: comment.post,
      });
      const recipientSettings = await settingsModel.findById(user.settings);
      if (recipientSettings.notificationSettings.mentionsOfUsername) {
        const notificationParameters = {
          recipient: userId,
          content: 'u/' + username + ' mentioned you in a comment',
          sender: comment.user._id,
          type: 'post',
          contentID: alteredPosts[0],
          body: comment.content,
        };
        notificationController.createNotification(notificationParameters);
        await userModel.findByIdAndUpdate(userId, {$inc: {notificationCount: 1}});
        if (user.deviceToken !== 'NONE' && user.deviceToken) {
          notificationController.sendNotification(user.id, notificationParameters.content, user.deviceToken);
        }
      }
    });
  }
  // Send a message to the post owner
  // Check if the comment's user is not the post's owner
  if (comment.user.id !== post.userID) {
    await messageModel.create({
      from: comment.user._id,
      fromType: 'users',
      to: post.userID,
      toType: 'users',
      subject: 'post reply: '+ post.title,
      comment: comment._id,
      message: comment.content,
      post: comment.post,
    });
    const recipientSettings = await settingsModel.findById(user.settings);
    if (!comment.user._id.equals(post.userID._id)) {
      if (recipientSettings.notificationSettings.commentsOnYourPost) {
        const notificationParameters = {
          recipient: post.userID,
          content: 'u/' + username + ' commented on your post',
          sender: comment.user._id,
          type: 'post',
          contentID: alteredPosts[0],
          body: comment.content,
        };
        notificationController.createNotification(notificationParameters);
        await userModel.findByIdAndUpdate(post.userID, {$inc: {notificationCount: 1}});
        if (user.deviceToken !== 'NONE' && user.deviceToken) {
          notificationController.sendNotification(user.id, notificationParameters.content, user.deviceToken);
        }
      }
    }
  }
});
// CREATING A MESSAGE NOT TESTED YET IN CREATE AND EDIT COMMENT
exports.createComment =catchAsync(async (req, res, next) => {
  const post = await postModel.findById(req.params.postid);
  if (!post) {
    return next(new AppError('no post with that id', 404));
  }
  if (!req.body.content) {
    return next(new AppError('no content found', 404));
  }
  if (post.locked) {
    return next(new AppError('post is locked', 400));
  }
  const comment = await commentModel.create({
    post: req.params.postid,
    user: req.user.id,
    content: req.body.content,
    mentioned: await handlerFactory.checkMentions(userModel, req.body.content),
  });
  await userModel.findByIdAndUpdate(req.user.id,
      {$addToSet: {'comments': comment._id}}, {new: true});
  post.commentsCount+=1;
  await post.save();
  createMessage(req, comment);
  res.status(201).json({
    status: 'success',
    data: {
      comment,
    },
  });
});
// TRY SEND MESSAGE TO NEWLY MENTIONED USERS IF COMMENT EDITED
exports.editComment = catchAsync(async (req, res, next) => {
  const comment = await commentModel.findById(req.params.id);
  if (!comment) {
    return next(new AppError('no comment with that id', 404));
  }
  if (comment.user.id != req.user.id) {
    return next(new AppError('you are not allowed to edit this comment', 404));
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
      createMessage(req, comment);
    });
  }
  res.status(200).json({
    status: 'success',
    data: {
      comment,
    },
  });
});

exports.deleteComment = catchAsync(async (req, res, next) => {
  const comment = await commentModel.findByIdAndDelete(req.params.id);
  if (!comment) {
    return next(new AppError('no comment with that id', 404));
  }
  if (comment.user.id != req.user.id) {
    return next(new AppError('you are not allowed to delete this comment', 403));
  }
  await userModel.findByIdAndUpdate(req.user.id,
      {$pull: {'comments': comment._id, 'savedPostsAndComments.comments': comment._id}}, {new: true});
  const post = await postModel.findById(comment.post);
  post.commentsCount-=1;
  await post.save();
  res.status(204).json({
    status: 'success',
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
  });
});

// not implemented yet waiting for moderation
exports.reportComment = catchAsync(async (req, res, next) => {});

exports.voteComment = handlerFactory.voteOne(commentModel, 'comments');


