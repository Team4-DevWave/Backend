const userModel = require('../models/usermodel');
const subredditModel = require('../models/subredditmodel');
const jwt = require('jsonwebtoken');
const {promisify} = require('util');
exports.alterPosts = async (req, posts) => {
  let token;
  if (
    req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) return posts;
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const user = await userModel.findById(decoded.userID);
  if (!user) return posts;
  const newPosts = [];
  console.log(user.username);

  for (const post of posts) {
    const userID=post.userID.id;
    if (post.subredditID) { // check access to private subreddit
      const subID=post.subredditID.id;
      const subreddit = await subredditModel.findById(post.subID);
      if (subreddit) {
        const stringSubs=user.joinedSubreddits.map((sub) => sub.toString());
        if (!stringSubs.includes(subID) && subreddit.srSettings.srType === 'private') {
          continue;
        }
      }
    }
    if (userID) { // check if the author blocked the user trying to access the post
      const poster=await userModel.findById(post.userID);
      if (poster) {
        const stringBlock=poster.blockedUsers.map((user) => user.toString());
        if (stringBlock.includes(user.id)) {
          continue;
        }
      }
    }
    const stringhidden=user.hiddenPosts.map((post) => post.toString());
    post.hidden=stringhidden.includes(post._id.toString());
    const stringSaved=user.savedPostsAndComments.posts.map((post) => post.toString());
    post.saved=stringSaved.includes(post._id.toString());
    const stringUpvoted=user.upvotes.posts.map((post) => post.toString());
    if (stringUpvoted.includes(post._id.toString())) {
      post.userVote='upvoted';
    }
    const stringDownvoted=user.downvotes.posts.map((post) => post.toString());
    if (stringDownvoted.includes(post._id.toString())) {
      post.userVote='downvoted';
    }
    if (!post.userVote) {
      post.userVote='none';
    }
    newPosts.push(post);
  }
  return newPosts;
};