const subredditModel = require('../models/subredditmodel');
const userModel = require('../models/usermodel');
const catchAsync = require('../utils/catchasync');
const handlerFactory = require('./handlerfactory');

exports.getAllSubreddits = handlerFactory.getAll(subredditModel);
exports.getSubreddit = handlerFactory.getOne(subredditModel);
exports.joinSubreddit = catchAsync(async (req, res, next) => {
  const subreddit = await subredditModel.findOne({name: req.params.subreddit});
  const user = req.user;
  await subredditModel.findByIdAndUpdate(subreddit.id, {$push: {membersID: user.id}});
  await userModel.findByIdAndUpdate(user.id, {$push: {joinedSubreddits: subreddit}});
  res.status(201).json({
    status: 'success',
    data: {
      subreddit,
      user,
    },
  });
});

exports.createCommunity = catchAsync(async (req, res, next) => {
  const newCommunity = await subredditModel.create(
      {
        name: req.body.name,
        moderatorsID: [req.user],
        membersID: [req.user],
        srSettings: {
          srType: req.body.srType,
          nsfw: req.body.nsfw,
        },
      });
  res.status(201).json({
    status: 'success',
    data: {
      newCommunity,
    },
  });
});
