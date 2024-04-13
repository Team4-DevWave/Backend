const postModel = require('../models/postmodel');
const userModel = require('../models/usermodel');
const subredditModel = require('../models/subredditmodel');
const AppError = require('../utils/apperror');
const catchAsync = require('../utils/catchasync');
const handlerFactory = require('./handlerfactory');
const paginate = require('../utils/paginate');
const cloudinary = require('cloudinary').v2;
const mongoose = require('mongoose');


cloudinary.config({
  cloud_name: 'dxy3lq6gh',
  api_key: '941913859728837',
  api_secret: 'R1IDiKXAcMkswyGb0Ac10wXk6tM',
});

exports.getBestPosts = catchAsync(async (req, res, next) => {
  const pageNumber = req.query.page || 1;
  const posts = paginate.paginate(await postModel.find({subredditID: {$exists: true}}).sort({numViews: -1}).exec(),
      10, pageNumber);

  res.status(200).json({
    status: 'success',
    data: {
      posts,
    },
  });
});

exports.getSubredditPosts = catchAsync(async (req, res, next) => {
  const pageNumber = req.query.page || 1;
  const posts = paginate.paginate(await postModel.find({
    subredditID: req.params.subredditid})
  , 10, pageNumber);
  res.status(200).json({
    status: 'success',
    data: {
      posts,
    },
  });
});

exports.sharePost= catchAsync(async (req, res, next) => {
  const destination = req.body.destination;
  if (!req.body.postid) {
    return next(new AppError('No Post', 400));
  }
  const post = await postModel.findById(req.body.postid);
  if (!post) {
    return next(new AppError('No post found with that ID', 404));
  }
  if (post.parentPost) {
    return next(new AppError('Cannot share a shared post', 400));
  }
  const newPostData= {
    // eslint-disable-next-line
    ...post._doc,
    // eslint-disable-next-line
    _id: new mongoose.Types.ObjectId(), 
    __v: 0,
    parentPost: post._id,
  };
  newPostData.numViews=0;
  newPostData.commentsCount=0;
  newPostData.userID=req.user._id;
  newPostData.postedTime=Date.now();
  newPostData.lastEditedTime=Date.now();
  newPostData.title= req.body.title? req.body.title: post.title;
  newPostData.nsfw= req.body.nsfw? req.body.nsfw: post.nsfw;
  newPostData.spoiler= req.body.spoiler? req.body.spoiler: post.spoiler;
  newPostData.vote= {upvotes: 0, downvotes: 0};
  if (destination==='') {
    const postsAsString = req.user.posts.map((post) => post.toString());
    if (postsAsString.includes(post.id)) {
      return next(new AppError('Post already here', 400));
    }
    newPostData.subredditID=null;
    const newPost = await postModel.create(newPostData);
    newPost.save();
    req.user.posts.push(newPost.id);
    req.user.save();
    const out=await postModel.findById(newPost.id);
    res.status(200).json({
      status: 'success',
      data: {
        post: out,
      },
    });
  } else {
    const subreddit = await subredditModel.findOne({name: destination});
    if (!subreddit) {
      return next(new AppError('No subreddit found with that name', 404));
    }
    const posts = await postModel.find({subredditID: subreddit.id}).exec();
    const postsAsString = posts.map((post) => post.id);
    if (postsAsString.includes(post.id)) {
      return next(new AppError('Post already here', 400));
    }
    newPostData.subredditID=subreddit.id;
    const newPost = await postModel.create(newPostData);
    newPost.save();
    const out=await postModel.findById(newPost.id);
    res.status(200).json({
      status: 'success',
      data: {
        post: out,
      },
    });
  }
});

exports.getPost = catchAsync(async (req, res, next) => {
  const post = await postModel.findById(req.params.postid);
  if (!post) {
    return next(new AppError('no post with that id', 404));
  }
  post.numViews += 1;
  await post.save();
  res.status(200).json({
    status: 'success',
    data: {
      post,
    },
  });
});

exports.editPost = catchAsync(async (req, res, next) => {
  let post = await postModel.findById(req.params.postid);
  if (!post) {
    return next(new AppError('no post with that id', 404));
  }
  req.body.lastEditedTime = Date.now();
  req.body.mentioned= await handlerFactory.checkMentions(userModel, req.body);
  post = await postModel.findByIdAndUpdate(req.params.postid, {$set: req.body}, {
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
  const post = await postModel.findByIdAndDelete(req.params.postid);
  if (post.userID.id != req.user.id) {
    return next(new AppError('You are not the owner of the post', 400));
  }
  if (!post) {
    return next(new AppError('no post with that id', 404));
  }
  res.status(204).json({
    status: 'success',
  });
});

exports.vote = handlerFactory.voteOne(postModel, 'posts');

exports.lockPost = catchAsync(async (req, res, next) => {
  const post = await postModel.findById(req.params.postid);
  if (!post) {
    return next(new AppError('No post found with that ID', 404));
  }
  if (post.userID.id != req.user.id) {
    return next(new AppError('You are not the owner of the post', 400));
  }
  post.locked = !post.locked;
  await post.save();
  res.status(200).json({
    status: 'success',
  });
});

exports.savePost = catchAsync(async (req, res, next) => {
  const post= await postModel.findById(req.params.postid);
  if (!post) {
    return next(new AppError('no post with that id', 404));
  }
  const postsAsString= req.user.savedPostsAndComments.posts.map((post) => post.toString());
  const update= postsAsString.includes(post.id) ?
  {$pull: {'savedPostsAndComments.posts': req.params.postid}}:
  {$addToSet: {'savedPostsAndComments.posts': req.params.postid}};

  await userModel.findByIdAndUpdate(req.user.id, update, {new: true});
  res.status(200).json({
    status: 'success',
  });
});

exports.hidePost = catchAsync(async (req, res, next) => {
  const post = await postModel.findById(req.params.postid);
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
  const post = await postModel.findById(req.params.postid);
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
  const post = await postModel.findById(req.params.postid);
  if (!post) {
    return next(new AppError('No post found with that ID', 404));
  }
  if (post.userID.id != req.user.id) {
    return next(new AppError('You are not the owner of the post', 400));
  }
  post.nsfw = !post.nsfw;
  await post.save();
  res.status(200).json({
    status: 'success',
  });
});

exports.markSpoiler = catchAsync(async (req, res, next) => {
  const post = await postModel.findById(req.params.postid);
  if (!post) {
    return next(new AppError('No post found with that ID', 404));
  }
  if (post.userID.id != req.user.id) {
    return next(new AppError('You are not the owner of the post', 400));
  }
  post.spoiler = !post.spoiler;
  await post.save();
  res.status(200).json({
    status: 'success',
  });
});

exports.getInsights = catchAsync(async (req, res, next) => {
  const post = await postModel.findById(req.params.postid);
  if (!post) {
    return next(new AppError('No post found with that ID', 404));
  }
  let upvotesRate=0;
  if (post.votes.upvotes + post.votes.downvotes > 0) {
    upvotesRate = post.votes.upvotes / (post.votes.upvotes + post.votes.downvotes) * 100;
  }
  res.status(200).json({
    status: 'success',
    data: {
      postID: post.id,
      numViews: post.numViews,
      upvotesRate: upvotesRate,
      numComments: post.commentsCount,
      numShares: 0,
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
      if (!req.body.image && !req.body.video) {
        return next(new AppError('No file uploaded', 400));
      } else {
        let media = null;
        if (req.body.image) {
          media = req.body.image;
        } else {
          media = req.body.video;
        }
        const result = await cloudinary.uploader.upload(`data:image/png;base64,${media}`, {
          resource_type: 'auto',
        });
        const url = result.secure_url;
        if (req.body.image) {
          newPost = await postModel.findByIdAndUpdate(newPostID, {image: url}, {new: true});
        } else {
          newPost = await postModel.findByIdAndUpdate(newPostID, {video: url}, {new: true});
        }
      }
    }
    if (req.body.type === 'url') {
      if (!req.body.url) {
        return next(new AppError('No link uploaded', 400));
      } else {
        newPost = await postModel.findByIdAndUpdate(newPostID, {url: req.body.url}, {new: true});
      }
    }
    if (req.body.type === 'poll') {
      if (!req.body.poll) {
        return next(new AppError('No options created', 400));
      } else {
        newPost = await postModel.findByIdAndUpdate(newPostID, {poll: req.body.poll}, {new: true});
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
    let newPost = await postModel.create({
      userID: req.user.id,
      postedTime: currentTime,
      title: req.body.title,
      type: req.body.type,
      spoiler: req.body.spoiler,
      nsfw: req.body.nsfw,
      content: req.body.content,
      subredditID: subreddit.id});
    const newPostID = newPost.id;
    if (req.body.type === 'image/video') {
      if (!req.body.image && !req.body.video) {
        return next(new AppError('No file uploaded', 400));
      } else {
        let media = null;
        if (req.body.image) {
          media = req.body.image;
        } else {
          media = req.body.video;
        }
        const result = await cloudinary.uploader.upload(`data:image/png;base64,${media}`, {
          resource_type: 'auto',
        });
        const url = result.secure_url;
        if (req.body.image) {
          newPost = await postModel.findByIdAndUpdate(newPostID, {image: url}, {new: true});
        } else {
          newPost = await postModel.findByIdAndUpdate(newPostID, {video: url}, {new: true});
        }
      }
    }
    if (req.body.type === 'url') {
      if (!req.body.url) {
        return next(new AppError('No link uploaded', 400));
      } else {
        newPost = await postModel.findByIdAndUpdate(newPostID, {url: req.body.url}, {new: true});
      }
    }
    if (req.body.type === 'poll') {
      if (!req.body.poll) {
        return next(new AppError('No options created', 400));
      } else {
        newPost = await postModel.findByIdAndUpdate(newPostID, {poll: req.body.poll}, {new: true});
      }
    }
    if (req.body.text_body) {
      newPost = await postModel.findByIdAndUpdate(newPostID, {text_body: req.body.text_body}, {new: true});
    }
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
