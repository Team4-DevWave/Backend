const subredditModel = require('../models/subredditmodel');
const handlerFactory = require('./handlerfactory');

exports.createSubreddit = catchAsync(async (req, res, next) => {
  const subreddit = await subredditModel.findOne({name: req.body.name});
  if (subreddit) {
    return next(new AppError('Subreddit already exists', 409));
  }
  const newCommunity = await subredditModel.create(
      {
        name: req.body.name,
        moderators: [req.user._id],
        members: [req.user._id],
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

exports.getSubreddit = catchAsync(async (req, res, next) => {
  const subreddit = await subredditModel.findOne({name: req.params.subreddit});
  if (!subreddit) {
    return next(new AppError('Subreddit does not exist', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      subreddit,
    },
  });
});

exports.getPostsBySubreddit = catchAsync(async (req, res, next) => { // TODO check access
  const pageNumber = req.query.page || 1;
  const subreddit = await subredditModel.findOne({name: req.params.subreddit}).populate('posts');
  subreddit.posts = paginate.paginate(subreddit.posts, 10, pageNumber);
  res.status(200).json({
    status: 'success',
    data: {
      posts: subreddit.posts,
    },
  });
});

exports.subscribeToSubreddit = catchAsync(async (req, res, next) => {
  const subreddit = await subredditModel.findOne({name: req.params.subreddit});
  if (!subreddit) {
    return next(new AppError('Subreddit does not exist', 404));
  }
  if (subreddit.srSettings.srType === 'private') {
    if (!subreddit.invitedUsers.includes(req.user.id)) {
      return next(new AppError('You cannot have access to this subreddit as it is private', 404));
    }
    await subredditModel.findByIdAndUpdate(subreddit.id, {
      $pull: {invitedUsers: req.user.id},
      new: true,
    });
  }
  if (subreddit.members.includes(req.user.id)) {
    return next(new AppError('You are already a member of this subreddit', 409));
  }
  const user = req.user;
  if (subreddit.members.includes(user.id)) {
    return next(new AppError('You are already subscribed to this subreddit', 400));
  }
  await subredditModel.findByIdAndUpdate(subreddit.id, {$push: {members: user.id}});
  user.joinedSubreddits.push(subreddit.id);
  await user.save();
  res.status(200).json({
    status: 'success',
  });
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
  res.status(200).json({
    status: 'success',
  });
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
