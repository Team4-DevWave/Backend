const commentModel = require('../models/commentsmodel');
const AppError = require('../utils/apperror');
const catchAsync = require('../utils/catchasync');
const handlerFactory = require('./handlerfactory');
const userModel = require('../models/usermodel');

exports.getComments = handlerFactory.getAll(commentModel);
exports.getComment = handlerFactory.getOne(commentModel);
exports.createComment = handlerFactory.createOne(commentModel, (req) => {
  req.body.post = req.params.postid;
  req.body.user = req.user.id;
  return req.body;
});
exports.editComment = handlerFactory.updateOne(commentModel, (req) => {
  req.body.lastEdited = Date.now();
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
  const user=await userModel.findByIdAndUpdate(req.user.id, update, {new: true});
  res.status(200).json({
    status: 'success',
    data: {
      comment: comment,
      user: user,
    },
  });
});

exports.reportComment = catchAsync(async (req, res, next) => {});
exports.voteComment = catchAsync(async (req, res, next) => {
  const voteType= req.body.voteType;
  const comment= await commentModel.findById(req.params.id);
  if (!comment) {
    return next(new AppError('no comment with that id', 404));
  }
  let uservote;

  if (req.user.upvotes.comments.includes(req.params.id)) {
    uservote=1;
  } else if (req.user.downvotes.comments.includes(req.params.id)) {
    uservote=-1;
  } else {
    uservote=0;
  }
  if (voteType==uservote) {
    comment.votes-=voteType;
    if (voteType==1) {
      req.user.upvotes.comments.pull(req.params.id);
    } else if (voteType==-1) {
      req.user.downvotes.comments.pull(req.params.id);
    }
  } else if (voteType==-uservote) {
    comment.votes+=2*voteType;
    if (voteType==1) {
      req.user.upvotes.comments.push(req.params.id);
      req.user.downvotes.comments.pull(req.params.id);
    } else if (voteType==-1) {
      req.user.downvotes.comments.push(req.params.id);
      req.user.upvotes.comments.pull(req.params.id);
    }
  } else {
    comment.votes+=voteType;
    if (voteType==1) {
      req.user.upvotes.comments.push(req.params.id);
    } else if (voteType==-1) {
      req.user.downvotes.comments.push(req.params.id);
    }
  }
  await comment.save();
  await req.user.save();
  res.status(200).json({
    status: 'success',
  });
});
exports.addCommentReply = catchAsync(async (req, res, next) => {});
