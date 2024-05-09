const catchAsync = require('../utils/catchasync');
const AppError = require('../utils/apperror');
const settingsmodel = require('../models/settingsmodel');
const notificationController = require('./notificationcontroller');
const postModel = require('../models/postmodel');
const userModel = require('../models/usermodel');
const postutil = require('../utils/postutil');


exports.voteOne=(model, voteOn)=> catchAsync(async (req, res, next) => {
  const voteType= req.body.voteType;
  if (voteType!==1 && voteType!==-1) {
    return next(new AppError('invalid vote type', 400));
  }
  const id = (voteOn == 'posts') ? req.params.postid : req.params.id;
  const doc= await model.findById(id);
  if (!doc) {
    return next(new AppError('no document with that id', 404));
  }
  let uservote;
  if (req.user.upvotes[voteOn].includes(id)) {
    uservote=1;
  } else if (req.user.downvotes[voteOn].includes(id)) {
    uservote=-1;
  } else {
    uservote=0;
  }
  if (uservote===0) {
    if (voteType==1) {
      doc.votes.upvotes+=1;
      req.user.upvotes[voteOn].push(id);
      if (voteOn === 'posts') {
        const user = await userModel.findById(doc.userID.id);
        const settings = await settingsmodel.findById(user.settings);
        const alteredPosts = await postutil.alterPosts(req, [doc]);
        if (doc.userID.id !== req.user.id) {
          if (settings.notificationSettings.upvotesOnYourPost) {
            const notificationParameters = {
              recipient: doc.userID,
              content: 'u/' + req.user.username + ' upvoted your post',
              sender: req.user.id,
              type: 'post',
              contentID: alteredPosts[0],
              body: doc.title,
            };
            notificationController.createNotification(notificationParameters);
            await userModel.findByIdAndUpdate(doc.userID, {$inc: {notificationCount: 1}});
            if (user.deviceToken !== 'NONE' && user.deviceToken) {
              notificationController.sendNotification(user.id, notificationParameters.content, user.deviceToken);
            }
          }
        }
      } else {
        const user = await userModel.findById(doc.user.id);
        const settings = await settingsmodel.findById(user.settings);
        const alteredPosts = await postutil.alterPosts(req, [await postModel.findById(doc.post)]);
        console.log(user.username);
        if (doc.user.id !== req.user.id) {
          if (settings.notificationSettings.upvotesOnYourComments) {
            const notificationParameters = {
              recipient: doc.user.id,
              content: 'u/' + req.user.username + ' upvoted your comment',
              sender: req.user.id,
              type: 'post',
              contentID: alteredPosts[0],
              body: doc.content,
            };
            notificationController.createNotification(notificationParameters);
            await userModel.findByIdAndUpdate(doc.userID, {$inc: {notificationCount: 1}});
            if (user.deviceToken !== 'NONE' && user.deviceToken) {
              notificationController.sendNotification(user.id, notificationParameters.content, user.deviceToken);
            }
          }
        }
      }
    }
    if (voteType==-1) {
      doc.votes.downvotes+=1;
      req.user.downvotes[voteOn].push(id);
    }
  } else {
    if (voteType==uservote) {
      if (voteType==1) {
        doc.votes.upvotes-=1;
        req.user.upvotes[voteOn].pull(id);
      }
      if (voteType==-1) {
        doc.votes.downvotes-=1;
        req.user.downvotes[voteOn].pull(id);
      }
    } else {
      if (voteType==1) {
        doc.votes.upvotes+=1;
        doc.votes.downvotes-=1;
        req.user.upvotes[voteOn].push(id);
        req.user.downvotes[voteOn].pull(id);
      }
      if (voteType==-1) {
        doc.votes.downvotes+=1;
        doc.votes.upvotes-=1;
        req.user.downvotes[voteOn].push(id);
        req.user.upvotes[voteOn].pull(id);
      }
    }
  }
  await doc.save();
  await req.user.save();
  res.status(200).json({
    status: 'success',
    data: doc.votes,
  });
});

exports.checkMentions=async (model, content)=> {
  const mentionRegex = /(?:r\/|u\/)(\w+)/g;
  let match;
  const mentionedUsers = [];
  while ((match = mentionRegex.exec(content)) !== null) {
    const mentionedUser = await model.findOne({username: match[1]});
    if (mentionedUser) {
      mentionedUsers.push(mentionedUser.id);
    }
  }
  return mentionedUsers;
};
