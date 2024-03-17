const subredditModel = require('../models/subredditmodel');
const AppError = require('../utils/apperror');
const catchAsync = require('../utils/catchasync');
const handlerFactory = require('./handlerfactory');

exports.getAllSubreddits = handlerFactory.getAll(subredditModel);
exports.createSubreddit = handlerFactory.createOne(subredditModel);
exports.getSubreddit = handlerFactory.getOne(subredditModel);
exports.joinSubreddit = catchAsync(async (req, res, next) => {
  const subreddit = await subredditModel.findOne({name: req.params.subreddit});
  const user = req.user;
  await subredditModel.findByIdAndUpdate(subreddit.id, {$push: {members: user.id}});
});
