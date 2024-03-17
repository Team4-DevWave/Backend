const postModel = require('../models/postmodel');
const userModel = require('./../models/usermodel');
const AppError = require('../utils/apperror');
const catchAsync = require('../utils/catchasync');
const handlerFactory = require('./handlerfactory');

exports.getPosts = handlerFactory.getAll(postModel);
exports.getPost = handlerFactory.getOne(postModel);
exports.createPost = handlerFactory.createOne(postModel);
exports.editPost = handlerFactory.updateOne(postModel);
exports.deletePost = handlerFactory.deleteOne(postModel);
exports.vote = catchAsync(async (req, res, next) => {});
exports.savePost = catchAsync(async (req, res, next) => {});
exports.hidePost = catchAsync(async (req, res, next) => {
  console.log('yo');
  const post = await postModel.findById(req.params.postid);
  if (!post) {
    return next(new AppError('No post found with that ID', 404));
  }
  await userModel.findByIdAndUpdate(req.user.id, {
    $push: {hiddenPosts: post.id},
  });
  await post.save();
  res.status(200).json({
    status: 'success',
    data: {
      post,
    },
  });
});
exports.unhidePost = catchAsync(async (req, res, next) => {
  const post = await postModel.findById(req.params.postid);
  if (!post) {
    return next(new AppError('No post found with that ID', 404));
  }
  await userModel.findByIdAndUpdate(req.user.id, {
    $pull: {hiddenPosts: post.id},
  });
  await post.save();
  res.status(200).json({
    status: 'success',
    data: {
      post,
    },
  });
});
exports.reportPost = catchAsync(async (req, res, next) => {});
exports.crosspost = catchAsync(async (req, res, next) => {});
