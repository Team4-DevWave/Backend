const subredditModel = require('../models/subredditmodel');
const AppError = require('../utils/apperror');
const catchAsync = require('../utils/catchasync');

exports.getAllSubreddits = catchAsync(async (req, res, next) => {
  const subreddits = await subredditModel.find({category: req.query.category});
  res.status(200).json({
    status: 'success',
    data: {
      subreddits,
    },
  });
});

exports.createSubreddit = catchAsync(async (req, res, next) => {
  const subreddit = await subredditModel.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      subreddit,
    },
  });
});

exports.getSubredditsOfCategory = catchAsync(async (req, res, next) => {
  const subreddits = await subredditModel.find({category: req.params.category});
  res.status(200).json({
    status: 'success',
    data: {
      subreddits,
    },
  });
});

exports.getSubreddit = catchAsync(async (req, res, next) => {
  const subreddit = await subredditModel.findOne({name: req.params.subreddit});
  res.status(200).json({
    status: 'success',
    data: {
      subreddit,
    },
  });
});

exports.getPostsBySubreddit = catchAsync(async (req, res, next) => {
  const subreddit = await subredditModel.findOne({name: req.params.subreddit}).populate('posts');
  res.status(200).json({
    status: 'success',
    data: {
      posts: subreddit.posts,
    },
  });
});

exports.subscribeToSubreddit = catchAsync(async (req, res, next) => {
  const subreddit = await subredditModel.findOne({name: req.params.subreddit});
  const user = req.user;
  if (subreddit.members.includes(user.id)) {
    return next(new AppError('You are already subscribed to this subreddit', 400));
  }
  await subredditModel.findByIdAndUpdate(subreddit.id, {$push: {members: user.id}});
  user.joinedSubreddits.push(subreddit.id);
  await user.save();
});

exports.unsubscribeToSubreddit = catchAsync(async (req, res, next) => {
  const subreddit = await subredditModel.findOne({name: req.params.subreddit});
  const user = req.user;
  if (!subreddit.members.includes(user.id)) {
    return next(new AppError('You are not subscribed to this subreddit', 400));
  }
  await subredditModel.findByIdAndUpdate(subreddit.id, {$pull: {members: user.id}});
  user.joinedSubreddits.pull(subreddit.id);
  await user.save();
});

exports.getSubredditRules = catchAsync(async (req, res, next) => {
  const subreddit = await subredditModel.findOne({name: req.params.subreddit});
  res.status(200).json({
    status: 'success',
    data: {
      rules: subreddit.rules,
    },
  });
});
