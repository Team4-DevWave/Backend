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
  const newComments = [];
  for (const comment of comments) {
    // const commentUser=comment.user.id;
    const commentPost=await postModel.findById(comment.post);
    if (commentPost && commentPost.subredditID) { // check access to private subreddit
      const subredditID=commentPost.subredditID.id;
      const subreddit = await subredditModel.findById(subredditID);
      if (subreddit) {
        const stringSubs=user.joinedSubreddits.map((sub) => sub.toString());
        if (!stringSubs.includes(subredditID) && subreddit.srSettings.srType === 'private') {
          continue;
        }
      }
    }
    if (user) { // check if the author blocked the user trying to access the post
      const poster=await userModel.findById(comment.user.id);
      if (poster) {
        const stringBlock=poster.blockedUsers.map((user) => user.toString());
        if (stringBlock.includes(user.id)) {
          continue;
        }
      }
    }
    const stringSaved=user.savedPostsAndComments.comments.map((comment) => comment.toString());
    comment.saved=stringSaved.includes(comment._id.toString());
    const stringUpvoted=user.upvotes.comments.map((comment) => comment.toString());
    const stringDownvoted=user.downvotes.comments.map((comment) => comment.toString());
    let userVote;
    if (stringUpvoted.includes(comment._id.toString())) {
      userVote='upvoted';
    } else if (stringDownvoted.includes(comment._id.toString())) {
      userVote='downvoted';
    } else {
      userVote='none';
    }
    const commentObj = comment.toObject();
    commentObj.userVote=userVote;
    newComments.push(commentObj);
  }
  return newComments;
};
