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
exports.editComment = handlerFactory.updateOne(commentModel);
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
  // if (req.body.voteType == 'upvote') {
  //   if (req.user.upvotes.comments.includes(req.params.commentid)) {
  //     await commentModel.findByIdAndUpdate(req.params.commentid, {$inc: {votes: -1}});
  //     await userModel.findByIdAndUpdate(req.user.id, {
  //       $pull: {'upvotes.comments': req.params.commentid},
  //     });
  //   } else {
  //     await commentModel.findByIdAndUpdate(req.params.commentid, {$inc: {votes: 1}});
  //     await userModel.findByIdAndUpdate(req.user.id, {
  //       $addToSet: {'upvotes.comments': req.params.commentid},
  //     });
  //   }
  // }
});
exports.addCommentReply = catchAsync(async (req, res, next) => {});
