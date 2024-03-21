const commentModel = require('../models/commentsmodel');
const AppError = require('../utils/apperror');
const catchAsync = require('../utils/catchasync');
const handlerFactory = require('./handlerfactory');
const userModel = require('../models/usermodel');

exports.getComments = handlerFactory.getAll(commentModel);
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
  // console.log(req.body.mentioned);
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

exports.reportComment = catchAsync(async (req, res, next) => {});


exports.voteComment = handlerFactory.voteOne(commentModel, 'comments');
exports.addCommentReply = catchAsync(async (req, res, next) => {});
