const postModel = require('../models/postmodel');
const userModel = require('../models/usermodel');
const catchAsync = require('../utils/catchasync');
const handlerFactory = require('./handlerfactory');

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
exports.savePost = catchAsync(async (req, res, next) => {});
exports.hidePost = catchAsync(async (req, res, next) => {});
exports.reportPost = catchAsync(async (req, res, next) => {});
exports.crosspost = catchAsync(async (req, res, next) => {});
