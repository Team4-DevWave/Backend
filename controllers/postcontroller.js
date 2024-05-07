const postModel = require('../models/postmodel');
const userModel = require('../models/usermodel');
const subredditModel = require('../models/subredditmodel');
const AppError = require('../utils/apperror');
const catchAsync = require('../utils/catchasync');
const handlerFactory = require('./handlerfactory');
const paginate = require('../utils/paginate');
const cloudinary = require('cloudinary').v2;
const mongoose = require('mongoose');
const notificationController = require('./notificationcontroller');
const postutil = require('../utils/postutil');
const {promisify} = require('util');
const jwt = require('jsonwebtoken');
const commentModel = require('../models/commentsmodel');
const settingsModel = require('../models/settingsmodel');


cloudinary.config({
  cloud_name: 'dxy3lq6gh',
  api_key: '941913859728837',
  api_secret: 'R1IDiKXAcMkswyGb0Ac10wXk6tM',
});

exports.getHotPosts = catchAsync(async (req, res, next) => {
  const pageNumber = req.query.page || 1;
  const paginatedPosts = paginate.paginate(await postModel.find({subredditID: {$exists: true, $ne: null}})
      .sort({numViews: -1}).exec(),
  10, pageNumber);
  const alteredPosts = await postutil.alterPosts(req, paginatedPosts);
  res.status(200).json({
    status: 'success',
    data: {
      posts: alteredPosts,
    },
  });
});
exports.getBestPosts = catchAsync(async (req, res, next) => {
  const pageNumber = req.query.page || 1;
  const paginatedPosts = paginate.paginate(await postModel.find({subredditID: {$exists: true, $ne: null}}).exec(),
      10, pageNumber);
  const alteredPosts = await postutil.alterPosts(req, paginatedPosts);
  res.status(200).json({
    status: 'success',
    data: {
      posts: alteredPosts,
    },
  });
});
exports.getNewPosts = catchAsync(async (req, res, next) => {
  const pageNumber = req.query.page || 1;
  const paginatedPosts = paginate.paginate(await postModel.find({subredditID: {$exists: true, $ne: null}})
      .sort({postedTime: -1}).exec(),
  10, pageNumber);
  const alteredPosts = await postutil.alterPosts(req, paginatedPosts);
  res.status(200).json({
    status: 'success',
    data: {
      posts: alteredPosts,
    },
  });
});
exports.getTopPosts = catchAsync(async (req, res, next) => {
  const pageNumber = req.query.page || 1;
  const paginatedPosts = paginate.paginate(await postModel.find({subredditID: {$exists: true, $ne: null}})
      .sort({'votes.upvotes': -1}).exec(), 10, pageNumber);
  const alteredPosts = await postutil.alterPosts(req, paginatedPosts);
  res.status(200).json({
    status: 'success',
    data: {
      posts: alteredPosts,
    },
  });
});


exports.getSubredditPosts = catchAsync(async (req, res, next) => {
  const pageNumber = req.query.page || 1;
  const paginatedPosts = paginate.paginate(await postModel.find({
    subredditID: req.params.subredditid})
  , 10, pageNumber);
  const alteredPosts = await postutil.alterPosts(req, paginatedPosts);
  res.status(200).json({
    status: 'success',
    data: {
      posts: alteredPosts,
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
    await postModel.findByIdAndUpdate(req.body.postid, {$inc: {numShares: 1}});
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
  const alteredPosts = await postutil.alterPosts(req, [post]);
  if (alteredPosts[0].type==='poll') {
    const currentTime = new Date();
    const postCreationTime = new Date(alteredPosts[0].postedTime);
    const timeDifferenceInMilliseconds = currentTime - postCreationTime;
    const timeDifferenceInSeconds = timeDifferenceInMilliseconds / 1000;

    // Convert the time difference from seconds to minutes
    const timeDifferenceInMinutes = timeDifferenceInSeconds / 60;

    // Convert the time difference from minutes to hours
    const timeDifferenceInHours = timeDifferenceInMinutes / 60;

    // Convert the time difference from hours to days
    const timeDifferenceInDays = timeDifferenceInHours / 24;
    if (timeDifferenceInDays >= alteredPosts[0].pollDuration) {
      alteredPosts[0].availableForVoting = false;
      await postModel.findByIdAndUpdate(alteredPosts[0].id, {availableForVoting: false}, {new: true});
    }
  }
  let token;
  if (
    req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    res.status(200).json({
      status: 'success',
      data: {
        post: alteredPosts[0],
      },
    });
  }
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const user = await userModel.findById(decoded.userID);
  if (!user) {
    res.status(200).json({
      status: 'success',
      data: {
        post: alteredPosts[0],
      },
    });
  }
  if (user.viewedPosts.includes(post._id)) {
    user.viewedPosts = user.viewedPosts.filter((id) => id.toString() !== post._id.toString());
  }
  user.viewedPosts.push(post._id);
  await user.save();
  res.status(200).json({
    status: 'success',
    data: {
      post: alteredPosts[0],
    },
  });
});

exports.editPost = catchAsync(async (req, res, next) => {
  let post = await postModel.findById(req.params.postid);
  if (!post) {
    return next(new AppError('no post with that id', 404));
  }
  if (post.userID.id != req.user.id) {
    return next(new AppError('You are not the owner of the post', 400));
  }
  req.body.lastEditedTime = Date.now();
  req.body.mentioned= await handlerFactory.checkMentions(userModel, req.body.text_body);
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
  const post = await postModel.findById(req.params.postid);
  if (!post) {
    return next(new AppError('no post with that id', 404));
  }
  if (post.userID.id != req.user.id) {
    return next(new AppError('You are not the owner of the post', 400));
  }
  await commentModel.deleteMany({post: post.id});
  await postModel.deleteOne({_id: req.params.postid});
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
  if (req.user.hiddenPosts.includes(post.id)) {
    return next(new AppError('Post already hidden', 400));
  }
  await userModel.findByIdAndUpdate(req.user.id, {
    $push: {hiddenPosts: post.id}}, {
    new: true});
  await post.save();
  res.status(200).json({
    status: 'success',
  });
});

exports.unhidePost = catchAsync(async (req, res, next) => {
  const post = await postModel.findById(req.params.postid);
  if (!post) {
    return next(new AppError('No post found with that ID', 404));
  }
  if (!req.user.hiddenPosts.includes(post.id)) {
    return next(new AppError('Post not hidden', 400));
  }
  await userModel.findByIdAndUpdate(req.user.id, {
    $pull: {hiddenPosts: post.id}}, {
    new: true});
  res.status(200).json({
    status: 'success',
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
      numShares: post.numShares,
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
        newPost = await postModel.findByIdAndUpdate(newPostID, {pollDuration: req.body.duration}, {new: true});
      }
    }
    if (req.body.text_body) {
      const mentioned = await handlerFactory.checkMentions(userModel, req.body.text_body);
      newPost = await postModel.findByIdAndUpdate(newPostID,
          {text_body: req.body.text_body, mentioned: mentioned}, {new: true});
      const alteredPosts = await postutil.alterPosts(req, [newPost]);
      for (let i = 0; i < mentioned; i++) {
        const settingsUser = await userModel.findById(mentioned[i]);
        const recipientSettings = await settingsModel.findById(settingsUser.settings);
        if (recipientSettings.notificationSettings.mentionsOfUsername) {
          const notificationParameters = {
            recipient: mentioned[i],
            content: 'u/' + req.user.username + ' mentioned you in a post',
            sender: req.user._id,
            type: 'post',
            contentID: alteredPosts[0],
            body: newPost.title,
          };
          notificationController.createNotification(notificationParameters);
          await userModel.findByIdAndUpdate(settingsUser, {$inc: {notificationCount: 1}});
          console.log(settingsUser.deviceToken);
          if (settingsUser.deviceToken !== 'NONE' && settingsUser.deviceToken) {
            notificationController.sendNotification(settingsUser.id, notificationParameters.content, settingsUser.deviceToken);   //eslint-disable-line
          }
        }
      }
    }
    post = newPost;
    const user = req.user;
    await userModel.findByIdAndUpdate(user.id, {$push: {posts: newPost.id}}, {new: true});
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
        newPost = await postModel.findByIdAndUpdate(newPostID, {pollDuration: req.body.duration}, {new: true});
      }
    }
    if (req.body.text_body) {
      const mentioned = await handlerFactory.checkMentions(userModel, req.body.text_body);
      newPost = await postModel.findByIdAndUpdate(newPostID,
          {text_body: req.body.text_body, mentioned: mentioned}, {new: true});
      const alteredPosts = await postutil.alterPosts(req, [newPost]);
      for (let i = 0; i < mentioned.length; i++) {
        const settingsUser = await userModel.findById(mentioned[i]);
        const recipientSettings = await settingsModel.findById(settingsUser.settings);
        if (recipientSettings.notificationSettings.mentionsOfUsername) {
          const notificationParameters = {
            recipient: mentioned[i],
            content: 'u/' + req.user.username + ' mentioned you in a post',
            sender: req.user._id,
            type: 'post',
            contentID: alteredPosts[0],
            body: newPost.title,
          };
          notificationController.createNotification(notificationParameters);
          await userModel.findByIdAndUpdate(settingsUser, {$inc: {notificationCount: 1}});
          if (settingsUser.deviceToken !== 'NONE' && settingsUser.deviceToken) {
            notificationController.sendNotification(settingsUser.id, notificationParameters.content, settingsUser.deviceToken);   //eslint-disable-line
          }
        }
      }
    }
    post = newPost;
    await subredditModel.findByIdAndUpdate(subreddit.id, {$push: {postsID: newPost.id}}, {new: true});
    await userModel.findByIdAndUpdate(req.user.id, {$push: {posts: newPost.id}}, {new: true});
    // const frequentMembers = await userModel.find({
    //   joinedSubreddits: subreddit.id,
    //   _id: {$ne: req.user._id}}).populate({path: 'settings', match: {
    //     'communityAlerts': 'frequent'}}).exec();    //eslint-disable-line
    const frequentMembers = await userModel.find({
      joinedSubreddits: subreddit.id,
      _id: {$ne: req.user._id},
    }).populate('settings').exec();
    const filteredMembers = frequentMembers.filter((user) =>
      user.settings.notificationSettings.communityAlerts.get(subreddit.name) === 'frequent',
    );
    const obj = {};
    for (const [key, value] of frequentMembers[0].settings.notificationSettings.communityAlerts.entries()) {
      obj[key] = value;
    }
    const lowMembers = await userModel.find({
      joinedSubreddits: subreddit.id,
      _id: {$ne: req.user._id},
    }).populate('settings').exec();
    const lowfilteredMembers = lowMembers.filter((user) =>
      user.settings.notificationSettings.communityAlerts.get(subreddit.name) === 'low',
    );
    for (let i = 0; i < filteredMembers.length; i++) {
      const user = await userModel.findById(filteredMembers[i]);
      const notificationParameters = {
        recipient: user.id,
        content: 'check out this post in r/' + subreddit.name + ' by u/' + req.user.username,
        sender: subreddit.id,
        type: 'post',
        contentID: post,
        body: post.title,
      };
      notificationController.createNotification(notificationParameters);
      await userModel.findByIdAndUpdate(user.id, {$inc: {notificationCount: 1}});
      if (user.deviceToken !== 'NONE' && user.deviceToken) {
        notificationController.sendNotification(user.id, notificationParameters.content, user.deviceToken);
      }
    }
    for (let i = 0; i < lowfilteredMembers.length; i++) {
      console.log('here');
      const user = await userModel.findById(lowfilteredMembers[i]);
      const number = Math.floor(Math.random() * (5 - 0 + 1)) + 0;
      if (number === 4) {
        const notificationParameters = {
          recipient: user.id,
          content: 'check out this post in r/' + subreddit.name + ' by u/' + req.user.username,
          sender: subreddit.id,
          type: 'post',
          contentID: post,
          body: post.title,
        };
        notificationController.createNotification(notificationParameters);
        await userModel.findByIdAndUpdate(user.id, {$inc: {notificationCount: 1}});
        if (user.deviceToken !== 'NONE' && user.deviceToken) {
          notificationController.sendNotification(user.id, notificationParameters.content, user.deviceToken);
        }
      }
    }
  }
  res.status(201).json({
    status: 'success',
    data: {
      post,
    },
  });
});

exports.votePoll = catchAsync(async (req, res, next) => {
  const post = await postModel.findById(req.params.postid);
  if (!post) {
    return next(new AppError('No post found with that ID', 404));
  }
  if (post.type !== 'poll') {
    return next(new AppError('Post is not a poll', 400));
  }
  const poll = post.poll;
  if (!poll.has(req.body.option)) {
    return next(new AppError('No such option', 400));
  }
  for (const option of poll.keys()) {
    if (poll.get(option).includes(req.user._id)) {
      return next(new AppError('Already voted another option', 400));
    }
  }
  post.poll.get(req.body.option).push(req.user._id);
  await post.save();
  res.status(200).json({
    status: 'success',
    poll: post.poll,
  });
});

exports.reportPost = catchAsync(async (req, res, next) => {}); // TODO NEED MODERATION
