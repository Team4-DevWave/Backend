const postModel = require('../models/postmodel');
const userModel = require('../models/usermodel');
const subredditModel = require('../models/subredditmodel');
const AppError = require('../utils/apperror');
const catchAsync = require('../utils/catchasync');
const handlerFactory = require('./handlerfactory');
const paginate = require('../utils/paginate');

exports.getPosts = catchAsync(async (req, res, next) => {
  const pageNumber = req.query.page || 1;
  const posts = await paginate.paginate(postModel.find({}), 10, pageNumber);
  res.status(200).json({
    status: 'success',
    data: {
      posts,
    },
  });
});

exports.getPost = catchAsync(async (req, res, next) => {
  const post = await postModel.findById(req.params.id);
  if (!post) {
    return next(new AppError('no post with that id', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      post,
    },
  });
});

exports.editPost = catchAsync(async (req, res, next) => {
  let post = await postModel.findById(req.params.id);
  if (!post) {
    return next(new AppError('no post with that id', 404));
  }
  req.body.lastEditedTime = Date.now();
  req.body.mentioned= await handlerFactory.checkMentions(userModel, req.body);
  post = await postModel.findByIdAndUpdate(req.params.id, {$set: req.body}, {
    new: true,
    runValidators: true});
  res.status(200).json({
    status: 'success',
    data: {
      post,
    },
  });
});

exports.deletePost = catchAsync(async (req, res, next) => {
  const post = await postModel.findById(req.params.id);
  if (!post) {
    return next(new AppError('no post with that id', 404));
  }
  await post.remove();
  res.status(204).json({
    status: 'success',
  });
});

exports.vote = handlerFactory.voteOne(postModel, 'posts');
exports.lockPost = catchAsync(async (req, res, next) => {
  const post = await postModel.findById(req.params.id);
  if (!post) {
    return next(new AppError('No post found with that ID', 404));
  }
  if (post.userID.toString() != req.user._id.toString()) {
    return next(new AppError('You are not the owner of the post', 400));
  }
  post.locked = !post.locked;
  await post.save();
  res.status(200).json({
    status: 'success',
  });
});
exports.savePost = catchAsync(async (req, res, next) => {
  const post= await postModel.findById(req.params.id);
  if (!post) {
    return next(new AppError('no post with that id', 404));
  }
  const update= req.user.savedPostsAndComments.posts.includes(post.id) ?
  {$pull: {'savedPostsAndComments.posts': req.params.id}}:
  {$addToSet: {'savedPostsAndComments.posts': req.params.id}};

  await userModel.findByIdAndUpdate(req.user.id, update, {new: true});
  res.status(200).json({
    status: 'success',
  });
});
exports.hidePost = catchAsync(async (req, res, next) => {
  const post = await postModel.findById(req.params.id);
  if (!post) {
    return next(new AppError('No post found with that ID', 404));
  }
  await userModel.findByIdAndUpdate(req.user.id, {
    $push: {hiddenPosts: post.id},
  });
  await post.save();
  res.status(200).json({
    status: 'success',
    data: {
      post,
    },
  });
});

exports.unhidePost = catchAsync(async (req, res, next) => {
  const post = await postModel.findById(req.params.id);
  if (!post) {
    return next(new AppError('No post found with that ID', 404));
  }
  await userModel.findByIdAndUpdate(req.user.id, {
    $pull: {hiddenPosts: post.id},
    new: true,
  });
  res.status(200).json({
    status: 'success',
    data: {
      post,
    },
  });
});
exports.markNSFW = catchAsync(async (req, res, next) => {
  const post = await postModel.findById(req.params.id);
  if (!post) {
    return next(new AppError('No post found with that ID', 404));
  }
  if (post.userID.toString() != req.user._id.toString()) {
    return next(new AppError('You are not the owner of the post', 400));
  }
  post.nsfw = !post.nsfw;
  await post.save();
  res.status(200).json({
    status: 'success',
  });
});
exports.markSpoiler = catchAsync(async (req, res, next) => {
  const post = await postModel.findById(req.params.id);
  if (!post) {
    return next(new AppError('No post found with that ID', 404));
  }
  if (post.userID.toString() != req.user._id.toString()) {
    return next(new AppError('You are not the owner of the post', 400));
  }
  post.spoiler = !post.spoiler;
  await post.save();
  res.status(200).json({
    status: 'success',
  });
});

exports.createPost = catchAsync(async (req, res, next) => {
  if (!req.params.subreddit) {
    return next(new AppError('Invalid Data Insertion', 400));
  }
  if (!req.url.startsWith('/submit/u/')) {
    const subreddit = await subredditModel.findOne({name: req.params.subreddit});
    if (!subreddit) {
      return next(new AppError('Subreddit not found', 404));
    }
  }
  const currentTime = new Date();
  let post = null;
  if (req.url.startsWith('/submit/u/')) {
    const newPost = await postModel.create({
      userID: req.user.id,
      postedTime: currentTime,
      title: req.body.title,
      type: req.body.type,
      spoiler: req.body.spoiler,
      nsfw: req.body.nsfw,
      content: req.body.content,
      approved: true});
    post = newPost;
    const user = req.user;
    await userModel.findByIdAndUpdate(user.id, {$push: {posts: newPost.id}});
  } else if (req.url.startsWith('/submit/r/')) {
    const subreddit = await subredditModel.findOne({name: req.params.subreddit});
    const newPost = await postModel.create({
      userID: req.user.id,
      postedTime: currentTime,
      title: req.body.title,
      type: req.body.type,
      spoiler: req.body.spoiler,
      nsfw: req.body.nsfw,
      content: req.body.content,
      subredditID: subreddit.id});
    post = newPost;
    await subredditModel.findByIdAndUpdate(subreddit.id, {$push: {postsID: newPost.id}});
    await userModel.findByIdAndUpdate(req.user.id, {$push: {posts: newPost.id}});
  }
  res.status(201).json({
    status: 'success',
    data: {
      post,
    },
  });
});
exports.reportPost = catchAsync(async (req, res, next) => {}); // TODO NEED MODERATION
exports.crosspost = catchAsync(async (req, res, next) => {});
