const subredditModel = require('../models/subredditmodel');
const catchAsync = require('../utils/catchasync');
const paginate = require('../utils/paginate');
const AppError = require('../utils/apperror');
const postModel = require('../models/postmodel');
// TODO exclude all not approved posts
exports.getAllSubreddits = catchAsync(async (req, res, next) => {
  const pageNumber = req.query.page || 1;
  let subreddits = await subredditModel.find({category: req.query.category});
  subreddits=paginate.paginate(subreddits, 10, pageNumber);
  res.status(200).json({
    status: 'success',
    data: {
      subreddits,
    },
  });
});

exports.createSubreddit = catchAsync(async (req, res, next) => {
  const subreddit = await subredditModel.findOne({name: req.body.name});
  if (subreddit) {
    return next(new AppError('Subreddit already exists', 409));
  }
  let newCommunity = await subredditModel.create(
      {
        name: req.body.name,
        moderators: [req.user._id],
        members: [req.user._id],
        srSettings: {
          srType: req.body.srType,
          nsfw: req.body.nsfw,
        },
      });
  if (req.body.category) {
    newCommunity = await subredditModel.findByIdAndUpdate(newCommunity.id, {category: req.body.category}, {new: true});
  }
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
// TODO test these gets and implement hot and random and best
exports.getTopPostsBySubreddit = catchAsync(async (req, res, next) => {
  if (!req.params.subreddit) {
    return next(new AppError('Please provide a subreddit', 400));
  }
  const subreddit = await subredditModel.findOne({name: req.params.subreddit});
  if (!subreddit) {
    return next(new AppError('Subreddit does not exist', 404));
  }
  const pageNumber = req.query.page || 1;
  const user = req.user;
  if (!subreddit.members.includes(user.id) && subreddit.srSettings.srType === 'private') {
    return next(new AppError('You are not subscribed to this subreddit', 400));
  }
  const posts = await postModel.find({subredditID: subreddit.id}).exec();
  const paginatedPosts = paginate.paginate(posts, 10, pageNumber);
  res.status(200).json({
    status: 'success',
    data: {
      posts: paginatedPosts,
    },
  });
});
exports.getRandomPostsBySubreddit = catchAsync(async (req, res, next) => {
  if (!req.params.subreddit) {
    return next(new AppError('Please provide a subreddit', 400));
  }
  const subreddit = await subredditModel.findOne({name: req.params.subreddit});
  if (!subreddit) {
    return next(new AppError('Subreddit does not exist', 404));
  }
  const pageNumber = req.query.page || 1;
  const user = req.user;
  if (!subreddit.members.includes(user.id) && subreddit.srSettings.srType === 'private') {
    return next(new AppError('You are not subscribed to this subreddit', 400));
  }
  const posts = await postModel.find({subredditID: subreddit.id}).exec();
  for (let i = posts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [posts[i], posts[j]] = [posts[j], posts[i]];
  }
  const paginatedPosts = paginate.paginate(posts, 10, pageNumber);
  res.status(200).json({
    status: 'success',
    data: {
      posts: paginatedPosts,
    },
  });
});
exports.getHotPostsBySubreddit = catchAsync(async (req, res, next) => {
  if (!req.params.subreddit) {
    return next(new AppError('Please provide a subreddit', 400));
  }
  const subreddit = await subredditModel.findOne({name: req.params.subreddit});
  if (!subreddit) {
    return next(new AppError('Subreddit does not exist', 404));
  }
  const pageNumber = req.query.page || 1;
  const user = req.user;
  if (!subreddit.members.includes(user.id) && subreddit.srSettings.srType === 'private') {
    return next(new AppError('You are not subscribed to this subreddit', 400));
  }
  // TODO randomize for random, sort by date edited for new, select a certain time frame for hot and sort
  const posts = await postModel.aggregate([
    {$match: {subredditID: subreddit._id}},
    {$addFields: {voteDifference: {$subtract: ['$votes.upvotes', '$votes.downvotes']}}},
    {$sort: {date: -1, voteDifference: -1}},
    {
      $lookup: {
        from: 'subreddits',
        let: {subredditID: '$subredditID'},
        pipeline: [
          {$match: {$expr: {$eq: ['$_id', '$$subredditID']}}},
          {$project: {name: 1, _id: 1}}, // replace 'name' with the fields you want to include
        ],
        as: 'subredditID',
      },
    },
    {$unwind: '$subredditID'},
    {
      $lookup: {
        from: 'users',
        let: {userID: '$userID'},
        pipeline: [
          {$match: {$expr: {$eq: ['$_id', '$$userID']}}},
          {$project: {username: 1, _id: 1}}, // replace 'name' with the fields you want to include
        ],
        as: 'userID',
      },
    },
    {$unwind: '$userID'},
  ]);
  const paginatedPosts = paginate.paginate(posts, 10, pageNumber);
  res.status(200).json({
    status: 'success',
    data: {
      posts: paginatedPosts,
    },
  });
});
exports.getNewPostsBySubreddit = catchAsync(async (req, res, next) => {
  if (!req.params.subreddit) {
    return next(new AppError('Please provide a subreddit', 400));
  }
  const subreddit = await subredditModel.findOne({name: req.params.subreddit});
  if (!subreddit) {
    return next(new AppError('Subreddit does not exist', 404));
  }
  const pageNumber = req.query.page || 1;
  const user = req.user;
  if (!subreddit.members.includes(user.id) && subreddit.srSettings.srType === 'private') {
    return next(new AppError('You are not subscribed to this subreddit', 400));
  }
  const posts = await postModel.find({subredditID: subreddit.id}).sort({'lastEditedTime': -1}).exec();
  const paginatedPosts = paginate.paginate(posts, 10, pageNumber);
  res.status(200).json({
    status: 'success',
    data: {
      posts: paginatedPosts,
    },
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

exports.getUserSubreddits = catchAsync(async (req, res, next) => {
  const subreddits = [];
  if (req.user.joinedSubreddits.length === 0) {
    res.status(200).json({
      status: 'success',
      data: {
        userSubreddits: [],
      },
    });
  }
  for (let i = 0; i < req.user.joinedSubreddits.length; i++) {
    const subreddit = await subredditModel.findById(req.user.joinedSubreddits[i]).select('name srLooks.icon');
    const {srLooks, ...otherProps} = subreddit._doc;
    subreddits.push({
      ...otherProps,
      icon: srLooks.icon,
    });
  }
  res.status(200).json({
    status: 'success',
    data: {
      userSubreddits: subreddits,
    },
  });
});

exports.deleteSubreddit = catchAsync(async (req, res, next) => {
  const subreddit = await subredditModel.findOne({name: req.params.subreddit});
  if (!subreddit) {
    return next(new AppError('Subreddit does not exist', 404));
  }
  if (!subreddit.moderators.includes(req.user.id)) {
    return next(new AppError('You are not a moderator of this subreddit', 403));
  }
  await subredditModel.findByIdAndDelete(subreddit.id);
  res.status(204).json({
    status: 'success',
  });
});
