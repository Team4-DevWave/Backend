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
  const type = req.params.userorsubreddit;
  // const name = req.query.subredditnam_or_username;
  const currentTime = new Date();
  let post = null;
  if (type ==='u') {
    const newPost = await postModel.create({userID: req.user.id, postedTime: currentTime,
      title: req.body.title, type: req.body.type, spoiler: req.body.spoiler,
      nsfw: req.body.nsfw, content: req.body.content});
    post = newPost;
    const user = req.user;
    await userModel.findByIdAndUpdate(user.id, {$push: {posts: newPost.id}});
  }
  res.status(201).json({
    status: 'success',
    data: {
      post,
    },
  });
});
