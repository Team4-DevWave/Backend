const userModel = require('../models/usermodel');
const postModel = require('../models/postmodel');
const subredditModel = require('../models/subredditmodel');
const jwt = require('jsonwebtoken');
const {promisify} = require('util');
exports.alterComments = async (req, comments) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) return comments;
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const user = await userModel.findById(decoded.userID);
  if (!user) return comments;

  // Fetch all necessary data upfront
  const postIds = comments.map((comment) => comment.post);
  const posts = await postModel.find({_id: {$in: postIds}});

  // Store posts in a map for faster lookups
  const postMap = new Map(posts.map((post) => [post._id.toString(), post]));

  const newComments = [];
  for (const comment of comments) {
    const commentPost = postMap.get(comment.post.toString());
    if (commentPost && commentPost.subredditID) { // check access to private subreddit
      const subreddit = await subredditModel.findById(commentPost.subredditID.id);
      if (subreddit) {
        const stringSubs = user.joinedSubreddits.map((sub) => sub.toString());
        if (!stringSubs.includes(subreddit._id.toString()) && subreddit.srSettings.srType === 'private') {
          continue;
        }
      }
    }
    if (user) { // check if the author blocked the user trying to access the post
      const poster = await userModel.findById(comment.user.id);
      if (poster) {
        const stringBlock = poster.blockedUsers.map((user) => user.toString());
        if (stringBlock.includes(user.id)) {
          continue;
        }
      }
    }
    const commentObj = comment.toObject();
    const stringSaved = user.savedPostsAndComments.comments.map((comment) => comment.toString());
    commentObj.saved = stringSaved.includes(comment._id.toString());
    const stringUpvoted = user.upvotes.comments.map((comment) => comment.toString());
    const stringDownvoted = user.downvotes.comments.map((comment) => comment.toString());
    let userVote;
    if (stringUpvoted.includes(comment._id.toString())) {
      userVote = 'upvoted';
    } else if (stringDownvoted.includes(comment._id.toString())) {
      userVote = 'downvoted';
    } else {
      userVote = 'none';
    }
    commentObj.userVote = userVote;
    newComments.push(commentObj);
  }
  return newComments;
};
exports.removeSr=async (comments)=>{
  const newComments=[];
  for (const comment of comments) {
    const commentObj = comment.toObject();
    if (commentObj.post&&commentObj.post.subredditID) {
      commentObj.post.subredditID={_id: commentObj.post.subredditID._id, name: commentObj.post.subredditID.name};
    }
    newComments.push(commentObj);
  }
  return newComments;
};
