const subredditModel = require('../models/subredditmodel');
const catchAsync = require('../utils/catchasync');
const paginate = require('../utils/paginate');
const AppError = require('../utils/apperror');
const postModel = require('../models/postmodel');
const userModel = require('../models/usermodel');
const postutil = require('../utils/postutil');
const commentModel = require('../models/commentsmodel');
const settingsModel = require('../models/settingsmodel');
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
  await userModel.findByIdAndUpdate(req.user.id, {$push: {joinedSubreddits: newCommunity.id}}, {new: true});
  const newSubredditUserMod = {
    allowModNotifications: true,
    activity: {
      newPosts: false,
      postsWithUpvotes: {
        allowNotification: false,
        advancedSetup: false,
        numberOfUpvotes: 5,
      },
      postsWithComments: {
        allowNotification: true,
        advancedSetup: false,
        numberOfComments: 3,
      },
    },
    reports: {
      posts: {
        allowNotification: true,
        advancedSetup: false,
        numberOfReports: 2,
      },
      comments: {
        allowNotification: true,
        advancedSetup: false,
        numberOfReports: 2,
      },
    },
  };
  await settingsModel.findByIdAndUpdate(req.user.settings, {
    $set: {
      [`notificationSettings.subredditsUserMods.${newCommunity.name}`]: newSubredditUserMod,
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

exports.subscribeToSubreddit = catchAsync(async (req, res, next) => {
  const subreddit = await subredditModel.findOne({name: req.params.subreddit});
  if (!subreddit) {
    return next(new AppError('Subreddit does not exist', 404));
  }
  if (subreddit.srSettings.srType === 'private') {
    if (subreddit.invitedUsers.some((user) => user._id.toString() === req.user.id)) {
      return next(new AppError('You cannot have access to this subreddit as it is private', 404));
    }
    await subredditModel.findByIdAndUpdate(subreddit.id, {
      $pull: {invitedUsers: req.user.id},
      new: true,
    });
  }
  const user = req.user;
  if (subreddit.members.some((member) => member._id.toString() === req.user.id)) {
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
  const posts = await postModel.find({subredditID: subreddit.id}).sort({'votes.upvotes': -1}).exec();
  const paginatedPosts = paginate.paginate(posts, 10, pageNumber);
  const alteredPosts = await postutil.alterPosts(req, paginatedPosts);
  res.status(200).json({
    status: 'success',
    data: {
      posts: alteredPosts,
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
  const posts = await postModel.find({subredditID: subreddit.id}).exec();
  for (let i = posts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [posts[i], posts[j]] = [posts[j], posts[i]];
  }
  const paginatedPosts = paginate.paginate(posts, 10, pageNumber);
  const alteredPosts = await postutil.alterPosts(req, paginatedPosts);
  res.status(200).json({
    status: 'success',
    data: {
      posts: alteredPosts,
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
  // TODO randomize for random, sort by date edited for new, select a certain time frame for hot and sort
  const posts = await postModel.find({subredditID: subreddit.id}).sort({numViews: -1}).exec();
  const paginatedPosts = paginate.paginate(posts, 10, pageNumber);
  const alteredPosts = await postutil.alterPosts(req, paginatedPosts);
  res.status(200).json({
    status: 'success',
    data: {
      posts: alteredPosts,
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
  const posts = await postModel.find({subredditID: subreddit.id}).sort({'lastEditedTime': -1}).exec();
  const paginatedPosts = paginate.paginate(posts, 10, pageNumber);
  const alteredPosts = await postutil.alterPosts(req, paginatedPosts);
  res.status(200).json({
    status: 'success',
    data: {
      posts: alteredPosts,
    },
  });
});

exports.unsubscribeToSubreddit = catchAsync(async (req, res, next) => {
  const subreddit = await subredditModel.findOne({name: req.params.subreddit});
  const user = req.user;
  if (!subreddit.members.some((member) => member._id.toString() === req.user.id)) {
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
    // eslint-disable-next-line
    const {srLooks, ...otherProps} = subreddit._doc;
    subreddits.push({
    // eslint-disable-next-line
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
exports.searchSubreddit=catchAsync(async (req, res, next) => {
  const query='.*'+req.query.q+'.*';
  const subredditName=req.params.subreddit;
  const sort= req.query.sort || 'Top';
  const pageNumber= req.query.page || 1;
  console.log('hi');
  if (!query || !subredditName) {
    next(new AppError('Please provide a search query', 400));
    return;
  }
  const subreddit=await subredditModel.find({name: subredditName});
  if (!subreddit) {
    next(new AppError('Subreddit does not exist', 404));
    return;
  }
  const posts = await postModel.find({
    title: {$regex: query, $options: 'i'},
    $and: [
      {subredditID: {$ne: null}},
      {subredditID: subreddit.id},
    ],
  }).exec();
  const media=posts.filter((post) => post.type === 'image/video');
  const comments=await commentModel.aggregate([
    {
      $match: {
        content: {$regex: query, $options: 'i'},
      },
    },
    {
      $lookup: {
        from: 'posts',
        localField: 'post',
        foreignField: '_id',
        as: 'post',
      },
    },
    {
      $unwind: '$post',
    },
    {
      $match: {
        'post.subredditID': subreddit._id,
      },
    },
  ]);

  // handling posts
  // handling comments
  // handling subreddits
  const paginatedPosts=paginate.paginate(posts, 10, pageNumber);
  const paginatedComments=paginate.paginate(comments, 10, pageNumber);
  const paginatedMedia=paginate.paginate(media, 10, pageNumber);
  res.status(200).json({
    status: 'success',
    data: {
      posts: paginatedPosts,
      comments: paginatedComments,
      media: paginatedMedia,
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
