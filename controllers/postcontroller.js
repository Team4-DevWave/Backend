const postModel = require('../models/postmodel');
const userModel = require('../models/usermodel');
const subredditModel = require('../models/subredditmodel');
const AppError = require('../utils/apperror');
const catchAsync = require('../utils/catchasync');
const handlerFactory = require('./handlerfactory');
const paginate = require('../utils/paginate');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const multer = require('multer');


cloudinary.config({
  cloud_name: 'dxy3lq6gh',
  api_key: '941913859728837',
  api_secret: 'R1IDiKXAcMkswyGb0Ac10wXk6tM',
});

const upload = multer({dest: 'uploads/'});

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
    let newPost = await postModel.create({
      userID: req.user.id,
      postedTime: currentTime,
      title: req.body.title,
      type: req.body.type,
      spoiler: req.body.spoiler,
      nsfw: req.body.nsfw,
      approved: true});
    const newPostID = newPost.id;
    if (req.body.type === 'image/video') {
      if (!req.body.image_vid) {
        return next(new AppError('No file uploaded', 400));
      } else {
        const result = await cloudinary.uploader.upload(`data:image/png;base64,${req.body.image_vid}`, {
          resource_type: 'auto',
        });
        const url = result.secure_url;
        newPost = await postModel.findByIdAndUpdate(newPostID, {image_vid: url}, {new: true});
      }
    }
    if (req.body.text_body) {
      newPost = await postModel.findByIdAndUpdate(newPostID, {text_body: req.body.text_body}, {new: true});
    }
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
