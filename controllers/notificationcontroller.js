const catchAsync = require('../utils/catchasync');
const notificationModel = require('../models/notificationmodel');
const subredditModel = require('../models/subredditmodel');
const AppError = require('../utils/apperror');
const userModel = require('../models/usermodel');
const settingsModel = require('../models/settingsmodel');


exports.getUserNotifications = catchAsync(async (req, res, next) => {
  const notifications = await notificationModel.find({recipient: req.user.id}).sort('-createdAt');
  res.status(200).json({
    status: 'success',
    data: {
      notifications,
    },
  });
});

exports.createNotification = catchAsync(async (notificationParameters) => {
  const currentTime = new Date();
  const notification = await notificationModel.create({
    recipient: notificationParameters.recipient,
    content: notificationParameters.content,
    createdAt: currentTime,
    sender: notificationParameters.sender,
    type: notificationParameters.type,
    contentID: notificationParameters.contentID,
  });
  return notification;
});

exports.hideNotification = catchAsync(async (req, res, next) => {
  let notification = await notificationModel.findById(req.params.notification_id);
  notification.hidden = true;
  notification = await notificationModel.findByIdAndUpdate(req.params.notification_id, {hidden: true}, {new: true});
  res.status(200).json({
    status: 'success',
  });
});

exports.disableSubredditUpdates = catchAsync(async (req, res, next) => {
  const subreddit = await subredditModel.findOne({name: req.params.subreddit_name});
  if (!subreddit) {
    return next(new AppError('No subreddit with that name', 404));
  }
  await userModel.findByIdAndUpdate(req.user.id, {$push: {disabledSubredditNotifications: subreddit.id}}, {new: true});
  res.status(200).json({
    status: 'success',
  });
});

exports.markRead = catchAsync(async (req, res, next) => {
  await notificationModel.findByIdAndUpdate(req.params.notification_id, {read: true}, {new: true});
  await userModel.findByIdAndUpdate(req.user.id, {$inc: {notificationCount: -1}});
  res.status(200).json({
    status: 'success',
  });
});

exports.markAllAsRead = catchAsync(async (req, res, next) => {
  await notificationModel.updateMany({recipient: req.user.id, read: false}, {read: true});
  await userModel.findByIdAndUpdate(req.user.id, {notificationCount: 0});
  res.status(200).json({
    status: 'success',
  });
});

exports.getNotificationSettings = catchAsync(async (req, res, next) => {
  const settings = await settingsModel.findById(req.user.settings);
  const notificationsSettings = settings.notificationSettings;
  res.status(200).json({
    status: 'success',
    data: {
      notificationsSettings,
    },
  });
});
