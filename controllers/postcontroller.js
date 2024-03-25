const postModel = require('../models/postmodel');
const userModel = require('../models/usermodel');
const subredditModel = require('../models/subredditmodel');
const AppError = require('../utils/apperror');
const catchAsync = require('../utils/catchasync');
const handlerFactory = require('./handlerfactory');

exports.getPosts = handlerFactory.getAll(postModel);
exports.getPost = handlerFactory.getOne(postModel);


exports.editPost = handlerFactory.updateOne(postModel, async (req) => {
  req.body.lastEditedTime = Date.now();
  req.body.mentioned= await handlerFactory.checkMentions(userModel, req.body.content);
  return req.body;
});


exports.deletePost = handlerFactory.deleteOne(postModel);


exports.vote = exports.voteComment = handlerFactory.voteOne(postModel, 'posts');


exports.savePost = catchAsync(async (req, res, next) => {
  const post= await postModel.findById(req.params.id);
  if (!post) {
    return next(new AppError('no post with that id', 404));
  }
  post.saved = !post.saved;
  await post.save();
  const update= post.saved ?
    {$addToSet: {'savedPostsAndComments.posts': req.params.id}} :
    {$pull: {'savedPostsAndComments.posts': req.params.id}};
  await userModel.findByIdAndUpdate(req.user.id, update, {new: true});
  res.status(200).json({
    status: 'success',
    data: {post,
    },
  });
});


exports.hidePost = catchAsync(async (req, res, next) => {
  console.log('yo');
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
  console.log('yo');
  const post = await postModel.findById(req.params.id);
  if (!post) {
    return next(new AppError('No post found with that ID', 404));
  }
  const user = await userModel.findByIdAndUpdate(req.user.id, {
    $pull: {hiddenPosts: post.id},
    new: true,
  });
  console.log(user.hiddenPosts);
  res.status(200).json({
    status: 'success',
    data: {
      post,
    },
  });
});

// exports.createPost = handlerFactory.createOne(postModel, async (req, res, next) => {
//   req.body.user = req.user.id;
//   req.body.mentioned=await handlerFactory.checkMentions(userModel, req.body.content);
//   if (!req.params.userorsubreddit || !req.params.subreddtnam_or_username) {
//     return res.status(400).json({
//       status: 'fail',
//       message: 'Invalid Data Insertion',
//     });
//   }
//   const subreddit = await subredditModel.findOne({name: req.params.subreddtnam_or_username});
//   if (!subreddit) {
//     return res.status(400).json({
//       status: 'fail',
//       message: 'Subreddit not found',
//     });
//   }
//   const type = req.params.userorsubreddit;
//   const currentTime = new Date();
//   let post = null;
//   if (type ==='u') {
//     const newPost = await postModel.create({
//       userID: req.user.id,
//       postedTime: currentTime,
//       title: req.body.title,
//       type: req.body.type,
//       spoiler: req.body.spoiler,
//       nsfw: req.body.nsfw,
//       content: req.body.content});
//     post = newPost;
//     const user = req.user;
//     await userModel.findByIdAndUpdate(user.id, {$push: {posts: newPost.id}});
//   }
//   return req.body;
// });


exports.createPost = catchAsync(async (req, res, next) => {
  if (!req.params.subreddtnam_or_username) {
    return res.status(400).json({
      status: 'fail',
      message: 'Invalid Data Insertion',
    });
  }
  if (!req.url.startsWith('/submit/u/')) {
    const subreddit = await subredditModel.findOne({name: req.params.subreddtnam_or_username});
    if (!subreddit) {
      return res.status(400).json({
        status: 'fail',
        message: 'Subreddit not found',
      });
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
    console.log(post);
    const user = req.user;
    await userModel.findByIdAndUpdate(user.id, {$push: {posts: newPost.id}});
  } else if (req.url.startsWith('/submit/r/')) {
    const subreddit = await subredditModel.findOne({name: req.params.subreddtnam_or_username});
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

exports.reportPost = catchAsync(async (req, res, next) => {});
exports.crosspost = catchAsync(async (req, res, next) => {});
