const subredditModel = require('../models/subredditmodel');
const postModel = require('../models/postmodel');
const catchasync = require('../utils/catchasync');
const userModel = require('../models/usermodel');


exports.getCommunities = catchasync(async (req, res, next) => {
  const communities = await subredditModel.find({});
  const userCommunities = req.user.joinedSubreddits;
  res.status(200).json({
    status: 'success',
    communities,
    userCommunities,
  });
});


exports.createPost = catchasync(async (req, res, next) => {
  if (!req.params.userorsubreddit || !req.params.subreddtnam_or_username) {
    return res.status(400).json({
      status: 'fail',
      message: 'Invalid Data Insertion',
    });
  }
  const subreddit = await subredditModel.findOne({name: req.params.subreddtnam_or_username});
  if (!subreddit) {
    return res.status(400).json({
      status: 'fail',
      message: 'Subreddit not found',
    });
  }
  const type = req.params.userorsubreddit;
  const currentTime = new Date();
  let post = null;
  if (type ==='u') {
    const newPost = await postModel.create({
      userID: req.user.id,
      postedTime: currentTime,
      title: req.body.title,
      type: req.body.type,
      spoiler: req.body.spoiler,
      nsfw: req.body.nsfw,
      content: req.body.content});
    post = newPost;
    const user = req.user;
    await userModel.findByIdAndUpdate(user.id, {$push: {posts: newPost.id}});
  } else if (type === 'r') {
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
    if (subreddit.srSettings.postReviewing) {
      await subredditModel.findByIdAndUpdate(subreddit.id, {$push: {postsToBeApproved: newPost.id}});
    } else {
      await subredditModel.findByIdAndUpdate(subreddit.id, {$push: {postsID: newPost.id}});
      await userModel.findByIdAndUpdate(req.user.id, {$push: {posts: newPost.id}});
    }
  }
  res.status(201).json({
    status: 'success',
    data: {
      post,
    },
  });
});

exports.createCommunity = catchasync(async (req, res, next) => {
  const newCommunity = await subredditModel.create(
      {
        name: req.body.name,
        moderatorsID: [req.user],
        membersID: [req.user],
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
