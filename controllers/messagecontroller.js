const messageModel = require('../models/messagesmodel');
const AppError = require('../utils/apperror');
const catchAsync = require('../utils/catchasync');
const userModel = require('../models/usermodel');
const paginate = require('../utils/paginate');
const subredditModel = require('../models/subredditmodel');
const notificationController = require('./notificationcontroller');
const webPush = require('web-push');
const vapidKeys = webPush.generateVAPIDKeys();
webPush.setVapidDetails(
    'mailto:moaaz.m.hashem@gmail.com',
    vapidKeys.publicKey,
    vapidKeys.privateKey,
);

exports.createMessage = catchAsync(async (req, res, next) => {
  const from = req.body.from.split('/');
  const to = req.body.to.split('/');
  if (from[0]==='u' || from[0]==='r') {
    if (from[0]==='u') {
      if (from[1]!=req.user.username) {
        return next(new AppError('you cannot send a message using other users name', 400));
      }
      req.body.from = req.user.id;
      req.body.fromType = 'users';
    } else if (from[0]==='r') {
      const subreddit=await subredditModel.findOne({name: from[1]});
      if (req.user.joinedSubreddits.includes(subreddit._id)) {
        if (!subreddit.moderators.includes(req.user.id)) {
          return next(
              new AppError('you cannot send a message using other subreddits name if you\'re not a moderator', 400));
        }
        req.body.from = subreddit._id;
      } else {
        return next(new AppError('you cannot send a message using other subreddits name if you\'re not a member', 400));
      }
      req.body.fromType = 'subreddits';
    }
  } else if (req.body.from==='') {
    req.body.from=req.user.id;
    req.body.fromType = 'users';
  }
  if (to[0]==='u' || to[0]==='r') {
    if (to[0]==='u') {
      const user = await userModel.findOne({username: to[1]});
      if (!user) {
        return next(new AppError('no user with that username', 404));
      }
      req.body.to = user._id;
      req.body.toType = 'users';
    } else if (to[0]==='r') {
      const subreddit=await subredditModel.findOne({name: to[1]});
      if (!subreddit) {
        return next(new AppError('no subreddit with that name', 404));
      }
      req.body.to = subreddit._id;
      req.body.toType = 'subreddits';
    }
  }
  req.body.createdAt = Date.now();
  const message= await messageModel.create(req.body);
  const notificationParameters = {
    recipient: req.body.to,
    content: 'u/' + req.user.username + ' sent you a message',
    sender: req.body.from,
    type: 'message',
    contentID: message._id,
  };
  notificationController.createNotification(notificationParameters);
  await userModel.findByIdAndUpdate(req.body.to, {$inc: {notificationCount: 1}});
  res.status(201).json({
    status: 'success',
    data: {
      message,
    },
  });
});

exports.getAllInbox = catchAsync(async (req, res, next) => {
  const pageNumber=req.query.page || 1;
  const messages = paginate.paginate(await messageModel.find({to: req.user.id}).sort({createdAt: -1}), 10, pageNumber);
  res.status(200).json({
    status: 'success',
    data: {
      messages,
    },
  });
});

exports.getAllSent = catchAsync(async (req, res, next) => {
  const pageNumber=req.query.page || 1;
  const messages = paginate.paginate(await messageModel.find({
    from: req.user.id,
    fromType: 'users',
    subject: {
      $not: {
        $in: [/^username mention/, /^post reply/],
      },
    },
    comment: {$exists: false},
    post: {$exists: false},
  })
      .populate('from', 'username')
      .populate('to', 'username').sort({createdAt: -1}), 10, pageNumber);
  res.status(200).json({
    status: 'success',
    data: {
      messages,
    },
  });
});

exports.getAllUnread = catchAsync(async (req, res, next) => {
  const pageNumber=req.query.page || 1;
  const messages = paginate.paginate(await messageModel.find({
    to: req.user.id,
    fromType: 'users',
    read: false,
  }).sort({createdAt: -1}), 10, pageNumber);
  res.status(200).json({
    status: 'success',
    data: {
      messages,
    },
  });
});

exports.getAllPostReply = catchAsync(async (req, res, next) => {
  const pageNumber=req.query.page || 1;
  const messages = paginate.paginate(await messageModel.find({
    to: req.user.id,
    toType: 'users',
    subject: {$regex: /^post reply/},
    comment: {$exists: true, $ne: null},
    post: {$exists: true, $ne: null},
  }).sort({createdAt: -1}), 10, pageNumber);
  res.status(200).json({
    status: 'success',
    data: {
      messages,
    },
  });
});

exports.getAllMentions = catchAsync(async (req, res, next) => {
  const pageNumber=req.query.page || 1;
  const messages = paginate.paginate(await messageModel.find({
    to: req.user.id,
    toType: 'users',
    subject: {$regex: /^username mention/},
    comment: {$exists: true, $ne: null},
    post: {$exists: true, $ne: null},
  }).sort({createdAt: -1}), 10, pageNumber);
  res.status(200).json({
    status: 'success',
    data: {
      messages,
    },
  });
});

exports.getMessages = catchAsync(async (req, res, next) => {
  const pageNumber=req.query.page || 1;
  const messages = paginate.paginate(await messageModel.find({
    to: req.user.id,
    toType: 'users',
    subject: {
      $not: {
        $in: [/^username mention/, /^post reply/],
      },
    },
    comment: {$exists: false},
    post: {$exists: false},
  }).populate('from', 'username')
      .populate('to', 'username').sort({createdAt: -1}), 10, pageNumber);
  res.status(200).json({
    status: 'success',
    data: {
      messages,
    },
  });
});

exports.getAllMessages = catchAsync(async (req, res, next) => {
  const pageNumber=req.query.page || 1;
  const messages = paginate.paginate(await messageModel.find({
    $or: [
      {from: req.user.id, fromType: 'users'},
      {to: req.user.id, toType: 'users'},
    ],
    subject: {
      $not: {
        $in: [/^username mention/, /^post reply/],
      },
    },
    comment: {$exists: false},
    post: {$exists: false},
  }).populate('from', 'username')
      .populate('to', 'username').sort({createdAt: -1}), 10, pageNumber);
  res.status(200).json({
    status: 'success',
    data: {
      messages,
    },
  });
});

exports.markAllRead = catchAsync(async (req, res, next) => {
  await messageModel.updateMany({to: req.user.id, toType: 'users'}, {read: true});
  res.status(200).json({
    status: 'success',
  });
});

exports.getMessage = catchAsync(async (req, res, next) => {
  const message = await messageModel.findById(req.params.id);
  if (!message) {
    return next(new AppError('no message with that id', 404));
  }
  if (message.to._id.toString() !== req.user.id.toString() && message.from._id.toString() !== req.user.id.toString()) {
    return next(new AppError('you are not allowed to access this message', 403));
  }
  res.status(200).json({
    status: 'success',
    data: {
      message,
    },
  });
});

exports.deleteMessage =catchAsync(async (req, res, next) => {
  const message = await messageModel.findByIdAndDelete(req.params.id);
  if (!message) {
    return next(new AppError('no message with that id', 404));
  }
  if (message.to._id.toString() !== req.user.id.toString() && message.from._id.toString() !== req.user.id.toString()) {
    return next(new AppError('you are not allowed to delete this message', 403));
  }
  res.status(204).json({
    status: 'success',
  });
});

exports.reportMessage = catchAsync(async (req, res, next) => { // NEED ADMIN OR MODERATION
  const message = await messageModel.findById(req.params.id);
  if (!message) {
    return next(new AppError('no message with that id', 404));
  }// TO DO
  res.status(200).json({
    status: 'success',
    data: {
      message,
    },
  });
});

exports.toggleReadMessage = catchAsync(async (req, res, next) => {
  const message = await messageModel.findById(req.params.id);
  if (!message) {
    return next(new AppError('no message with that id', 404));
  }
  message.read = !message.read;
  await message.save();
  res.status(200).json({
    status: 'success',
  });
});

