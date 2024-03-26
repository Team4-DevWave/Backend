const subredditModel = require('../models/subredditmodel');
const userModel = require('../models/usermodel');
const catchAsync = require('../utils/catchasync');
const handlerFactory = require('./handlerfactory');
const AppError = require('../utils/apperror');

exports.getSubreddit = handlerFactory.getOne(subredditModel);


exports.joinSubreddit = catchAsync(async (req, res, next) => {
  const subreddit = await subredditModel.findOne({name: req.params.subreddit});
  if (!subreddit) {
    return next(new AppError('Subreddit does not exist', 404));
  }
  if (subreddit.srSettings.srType === 'private') {
    if (!subreddit.invitedUsers.includes(req.user.id)) {
      return next(new AppError('You cannot have access to this subreddit as it is private', 403));
    }
    await subredditModel.findByIdAndUpdate(subreddit.id, {
      $pull: {invitedUsers: req.user.id},
      new: true,
    });
  }
  if (subreddit.membersID.includes(req.user.id)) {
    return next(new AppError('You are already a member of this subreddit', 409));
  }
  const user = req.user;
  await subredditModel.findByIdAndUpdate(subreddit.id, {
    $push: {membersID: user.id}});
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
  const subreddit = await subredditModel.findOne({name: req.body.name});
  if (subreddit) {
    return next(new AppError('Subreddit already exists', 409));
  }
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
