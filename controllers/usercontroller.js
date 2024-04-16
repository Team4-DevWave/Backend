const userModel = require('../models/usermodel');
const AppError = require('../utils/apperror');
const postModel = require('../models/postmodel');
const catchAsync = require('../utils/catchasync');
const commentModel = require('../models/commentsmodel');
// const handlerFactory = require('./handlerfactory');
const settingsModel = require('../models/settingsmodel');
const paginate = require('../utils/paginate');
exports.usernameAvailable=catchAsync(async (req, res, next)=>{
  if (!req.params.username) {
    return next(new AppError('Please provide a username', 404));
  }
  const username=req.params.username;
  const user=await userModel.findOne({username: username});
  if (user || username==='me') {
    return next(new AppError('Username not available', 404));
  }
  res.status(200).json({
    status: 'success',
    message: 'Username available',
  });
});
exports.emailAvailable=catchAsync(async (req, res, next)=>{
  if (!req.params.email) {
    return next(new AppError('Please provide a email', 404));
  }
  const email=req.params.email;
  const user=await userModel.findOne({email: email});
  if (user) {
    return next(new AppError('Email not available', 404));
  }
  res.status(200).json({
    status: 'success',
    message: 'Email available',
  });
});
exports.getPosts=catchAsync(async (req, res, next)=>{
  const username = req.params.username;
  const pageNumber=req.query.page || 1;
  const user=await userModel.findOne({username: username});
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  const posts=paginate.paginate(await postModel.find({userID: user._id}).exec(), 10, pageNumber);
  res.status(200).json({
    status: 'success',
    data: {
      posts: posts,
    },
  });
});
exports.getComments=catchAsync(async (req, res, next)=>{
  const username = req.params.username;
  const pageNumber=req.query.page || 1;
  const user=await userModel.findOne({username: username});
  if (!user) {
    return next(new AppError('User not found', 400));
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
  const username = req.params.username;
  const pageNumber=req.query.page || 1;
  const user=await userModel.findOne({username: username});
  if (!user) {
    return next(new AppError('User not found', 400));
  }
  const posts=paginate.paginate(await postModel.find({userID: user._id}).exec(), 10, pageNumber);
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
  const pageNumber=req.query.page || 1;
  const hiddenPosts = await postModel.find({_id: {$in: req.user.hiddenPosts}});
  const posts = paginate.paginate(hiddenPosts, 10, pageNumber);
  res.status(200).json({
    status: 'success',
    data: {
      posts: posts,
    },
  });
});
exports.getSaved=catchAsync(async (req, res, next)=>{
  const pageNumber=req.query.page || 1;
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
  const username = req.params.username;
  const user=await userModel.findOne({username: username});
  if (!user) {
    return next(new AppError('User not found', 400));
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
      return next(new AppError('No user with that username', 404));
    }
    const currentUser = await userModel.findById(req.user.id);
    const actionField = action + 'edUsers';
    const userExist = currentUser[actionField].includes(targetUser._id);
    if (userExist && subaction === 'add') {
      return next(new AppError(`You have already ${action}ed this user`, 400));
    } else if (!userExist && subaction === 'remove') {
      return next(new AppError(`You haven't ${action}ed this user`, 400));
    }
    const updateOperation = subaction === 'add' ? '$addToSet' : '$pull';
    const updatedUser = await userModel.findByIdAndUpdate(req.user.id, {
      [updateOperation]: {[actionField]: targetUser._id},
    }, {new: true});
    updatedUser.save();
    let statusCode;
    subaction === 'add' ? statusCode=200 : statusCode=204;
    res.status(statusCode).json({
      status: 'success',
      data: {
        user: updatedUser,
      },
    });
  });

exports.unfollowBlockedUser=catchAsync(async (req, res, next) => {
  const user =await userModel.findById(req.user.id);
  const blockUser= await userModel.findOne({username: req.params.username});
  if (blockUser && user.followedUsers.includes(blockUser._id)) {
    user.followedUsers.pull(blockUser._id);
    await user.save();
  }
  next();
});
exports.checkBlocked=catchAsync(async (req, res, next) => {
  const user =await userModel.findById(req.user.id);
  const followUser= await userModel.findOne({username: req.params.username});
  if (followUser && user.blockedUsers.includes(followUser._id)) {
    return next(new AppError('You have blocked this user', 400));
  }
  next();
});
exports.addFriend = handleUserAction('follow', 'add');
exports.removeFriend =handleUserAction('follow', 'remove');
exports.blockUser = handleUserAction('block', 'add');
exports.unblockUser = handleUserAction('block', 'remove');
exports.getCurrentUser = catchAsync(async (req, res, next) => { // TODO moderate output
  const output=await req.user.populate('blockedUsers', 'username');
  res.status(200).json({
    status: 'success',
    data: {
      user: output,
    },
  });
});
exports.getMySettings = catchAsync(async (req, res, next) => {
  const settings = await settingsModel.findById(req.user.settings);
  res.status(200).json({
    status: 'success',
    data: {
      settings: settings,
    },
  });
});
exports.updateMySettings = catchAsync(async (req, res, next) => {
  const settings = await settingsModel.findByIdAndUpdate(req.user.settings, {$set: req.body}, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
    data: {
      settings: settings,
    },
  });
});
exports.deleteMe = catchAsync(async (req, res, next) => {
  await userModel.findByIdAndUpdate(req.user.id, {active: false});
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getUserByUsername = catchAsync(async (req, res, next) => {
  const username = req.params.username;
  if (!username) {
    return next(new AppError('Please provide a username', 400));
  }
  const user=await userModel.findOne({username: username});
  if (!user) {
    return next(new AppError('No user with that username', 404));
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

exports.deleteUser = catchAsync(async (req, res, next) => { // for admin
  const username = req.params.username;
  if (!username) {
    return next(new AppError('Please provide a username', 400));
  }
  const user=await userModel.findOne({username: username});
  if (!user) {
    return next(new AppError('No user with that username', 404));
  }
  await settingsModel.deleteOne({_id: user.settings});
  await userModel.deleteOne({_id: user.id});
  res.status(204).json({
    status: 'success',
  });
});

exports.changeCountry = catchAsync(async (req, res, next) => {
  const user = await userModel.findById(req.user.id);
  user.country = req.body.country;
  await user.save();
  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});
