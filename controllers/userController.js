const userModel = require('../models/usermodel');
const Apperror = require('../utils/apperror');
const postModel = require('../models/postmodel');
const catchAsync = require('../utils/catchasync');
const commentModel = require('../models/commentsmodel');
const handlerFactory = require('./handlerfactory');
const settingsModel = require('../models/settingsmodel');
const paginate = require('../utils/paginate');
exports.usernameAvailable=catchAsync(async (req, res, next)=>{
  if (!req.params.username) {
    return next(new Apperror('Please provide a username', 400));
  }
  const username=req.params.username;
  const user=await userModel.findOne({username: username});
  if (user) {
    return next(new Apperror('Username not available', 400));
  }
  res.status(200).json({
    status: 'success',
    message: 'Username available',
  });
});
exports.getPosts=catchAsync(async (req, res, next)=>{
  const username=req.params.username;
  const pageNumber=req.params.pageNumber || 1;
  const user=await userModel.findOne({username: username});
  if (!user) {
    return next(new Apperror('User not found', 400));
  }
  const posts=paginate.paginate(await postModel.find({userID: user._id, hidden: false}), 10, pageNumber);
  res.status(200).json({
    status: 'success',
    data: {
      posts: posts,
    },
  });
});
exports.getComments=catchAsync(async (req, res, next)=>{
  const username=req.params.username;
  const pageNumber=req.params.pageNumber || 1;
  const user=await userModel.findOne({username: username});
  if (!user) {
    return next(new Apperror('User not found', 400));
  }
  const comments=paginate.paginate(await commentModel.find({user: user._id}), 10, pageNumber);
  res.status(200).json({
    status: 'success',
    data: {
      comments: comments,
    },
  });
});
exports.getOverview=catchAsync(async (req, res, next)=>{
  const username=req.params.username;
  console.log(username);
  const pageNumber=req.params.pageNumber || 1;
  const user=await userModel.findOne({username: username});
  if (!user) {
    return next(new Apperror('User not found', 400));
  }
  const posts=paginate.paginate(await postModel.find({userID: user._id, hidden: false}), 10, pageNumber);
  const comments=paginate.paginate(await commentModel.find({user: user._id}), 10, pageNumber);
  res.status(200).json({
    status: 'success',
    data: {
      comments: comments,
      posts: posts,
    },
  });
});
exports.gethiddenPosts=catchAsync(async (req, res, next)=>{
  const pageNumber=req.params.pageNumber || 1;
  const posts=paginate.paginate(await postModel.find({userID: req.user.id, hidden: true}), 10, pageNumber);
  res.status(200).json({
    status: 'success',
    data: {
      posts: posts,
    },
  });
});
exports.getSaved=catchAsync(async (req, res, next)=>{
  const pageNumber=req.params.pageNumber || 1;
  const comments=paginate.paginate(await commentModel.find({_id: {$in: req.user.savedPostsAndComments.comments}}),
      10, pageNumber);
  const posts=paginate.paginate(await postModel.find({_id: {$in: req.user.savedPostsAndComments.posts}}),
      10, pageNumber);
  res.status(200).json({
    status: 'success',
    data: {
      posts: posts,
      comments: comments,
    },
  });
});
exports.getAbout=catchAsync(async (req, res, next)=>{
  const username=req.params.username;
  const user=await userModel.findOne({username: username});
  if (!user) {
    return next(new Apperror('User not found', 400));
  }
  // TODO add a follower count field and return it here
  res.status(200).json({
    status: 'success',
    data: {
      postKarma: user.karma.posts,
      commentKarma: user.karma.comments,
      cakeDay: user.dateJoined,
    },
  });
});
exports.getUpvoted=catchAsync(async (req, res, next)=>{
  res.status(200).json({
    status: 'success',
    data: {
      posts: req.user.upvotes.posts,
      comments: req.user.upvotes.comments,
    },
  });
});
exports.getDownvoted=catchAsync(async (req, res, next)=>{
  res.status(200).json({
    status: 'success',
    data: {
      posts: req.user.downvotes.posts,
      comments: req.user.downvotes.comments,
    },
  });
});
const handleUserAction = (action, subaction) =>
  catchAsync(async (req, res, next) => {
    const targetUser = await userModel.findOne({username: req.params.username});
    if (!targetUser) {
      return next(new Apperror('No user with that username', 404));
    }
    const currentUser = await userModel.findById(req.user.id);
    const actionField = action + 'edUsers';
    const userExist = currentUser[actionField].includes(targetUser._id);
    if (userExist && subaction === 'add') {
      return next(new Apperror(`You have already ${action}ed this user`, 400));
    } else if (!userExist && subaction === 'remove') {
      return next(new Apperror(`You haven't ${action}ed this user`, 400));
    }
    const updateOperation = subaction === 'add' ? '$addToSet' : '$pull';
    const updatedUser = await userModel.findByIdAndUpdate(req.user.id, {
      [updateOperation]: {[actionField]: targetUser._id},
    }, {new: true});
    updatedUser.save();
    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser,
      },
    });
  });

exports.unfollowBlockedUser=catchAsync(async (req, res, next) => {
  const user =await userModel.findById(req.user.id);
  const blockUser= await userModel.findOne({username: req.params.username});
  if (user.followedUsers.includes(blockUser._id)) {
    user.followedUsers.pull(blockUser._id);
    await user.save();
  }
  next();
});

exports.checkBlocked=catchAsync(async (req, res, next) => {
  const user =await userModel.findById(req.user.id);
  const followUser= await userModel.findOne({username: req.params.username});
  if (user.blockedUsers.includes(followUser._id)) {
    return next(new Apperror('You have blocked this user', 400));
  }
  next();
});

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.setSettingsId = (req, res, next) => {
  req.params.id = req.user.settings;
  next();
};
exports.getUser = handlerFactory.getOne(userModel);
exports.getMySettings = handlerFactory.getOne(settingsModel);
exports.updateMySettings = handlerFactory.updateOne(settingsModel);
exports.deleteMe = catchAsync(async (req, res, next) => {
  await userModel.findByIdAndUpdate(req.user.id, {active: false});
  res.status(204).json({
    status: 'success',
    data: null,
  });
});
exports.addFriend = handleUserAction('follow', 'add');
exports.removeFriend =handleUserAction('follow', 'remove');
exports.blockUser = handleUserAction('block', 'add');
exports.unblockUser = handleUserAction('block', 'remove');
exports.getUserByUsername = catchAsync(async (req, res, next) => {
  const username = req.params.username;
  if (!username) {
    return next(new Apperror('Please provide a username', 400));
  }
  const user=await userModel.findOne({username: username});
  if (!user) {
    return next(new Apperror('No user with that username', 404));
  } // TODO continue this
  res.status(200).json({
    status: 'success',
    data: {
      postKarma: user.karma.posts,
      commentKarma: user.karma.comments,
      cakeDay: user.dateJoined,
    },
  });
});
