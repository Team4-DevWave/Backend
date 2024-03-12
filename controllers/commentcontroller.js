const commentModel = require("../models/commentsmodel");
const appError = require("../utils/apperror");
const catchAsync = require("../utils/catchasync");
const handlerFactory = require("./handlerfactory");

exports.getComments = handlerFactory.getAll(commentModel);
exports.getComment = handlerFactory.getOne(commentModel);
exports.createComment = handlerFactory.createOne(commentModel);
exports.editComment = handlerFactory.updateOne(commentModel);
exports.deleteComment = handlerFactory.deleteOne(commentModel);
exports.saveComment = catchAsync(async (req, res, next) => {});
exports.reportComment = catchAsync(async (req, res, next) => {});
exports.voteComment = catchAsync(async (req, res, next) => {});
exports.addCommentReply = catchAsync(async (req, res, next) => {});