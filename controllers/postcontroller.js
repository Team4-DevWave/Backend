const postModel = require('../models/postmodel');
const userModel = require('../models/usermodel');
const catchAsync = require('../utils/catchasync');
const handlerFactory = require('./handlerfactory');
const AppError = require('../utils/apperror');

exports.getPosts = handlerFactory.getAll(postModel);
exports.getPost = handlerFactory.getOne(postModel);
exports.createPost = handlerFactory.createOne(postModel, async (req) => {
  req.body.user = req.user.id;
  req.body.mentioned=await handlerFactory.checkMentions(userModel, req.body.content);
  return req.body;
});
exports.editPost = handlerFactory.updateOne(postModel, async (req) => {
  req.body.lastEditedTime = Date.now();
  req.body.mentioned= await handlerFactory.checkMentions(userModel, req.body.content);
  return req.body;
});
exports.deletePost = handlerFactory.deleteOne(postModel);
exports.vote = exports.voteComment = handlerFactory.voteOne(postModel, 'posts');
exports.savePost = catchAsync(async (req, res, next) => {
  const post= await postModel.findById(req.params.id);
  if (!post) {
    return next(new AppError('no post with that id', 404));
  }
  post.saved = !post.saved;
  await post.save();
  const update= post.saved ?
    {$addToSet: {'savedPostsAndComments.posts': req.params.id}} :
    {$pull: {'savedPostsAndComments.posts': req.params.id}};
  await userModel.findByIdAndUpdate(req.user.id, update, {new: true});
  res.status(200).json({
    status: 'success',
    data: {post,
    },
  });
});
exports.hidePost = handlerFactory.updateOne(postModel, async (req) => {// hide/unhide post
  req.body.hidden = !req.body.hidden;
  return req.body;
});
exports.reportPost = catchAsync(async (req, res, next) => {});
exports.crosspost = catchAsync(async (req, res, next) => {});
