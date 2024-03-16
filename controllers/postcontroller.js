const postModel = require('../models/postmodel');
const catchAsync = require('../utils/catchasync');
const handlerFactory = require('./handlerfactory');

exports.getPosts = handlerFactory.getAll(postModel);
exports.getPost = handlerFactory.getOne(postModel);
exports.createPost = handlerFactory.createOne(postModel);
exports.editPost = handlerFactory.updateOne(postModel);
exports.deletePost = handlerFactory.deleteOne(postModel);
exports.vote = catchAsync(async (req, res, next) => {});
exports.savePost = catchAsync(async (req, res, next) => {});
exports.hidePost = catchAsync(async (req, res, next) => {});
exports.reportPost = catchAsync(async (req, res, next) => {});
exports.crosspost = catchAsync(async (req, res, next) => {});
