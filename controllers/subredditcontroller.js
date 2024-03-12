const subredditModel = require("../models/subredditmodel");
const appError = require("../utils/apperror");
const catchAsync = require("../utils/catchasync");
const handlerFactory = require("./handlerfactory");

exports.getAllSubreddits = handlerFactory.getAll(subredditModel);
exports.createSubreddit = handlerFactory.createOne(subredditModel);
exports.getSubreddit = handlerFactory.getOne(subredditModel);