const catchAsync = require('../utils/catchasync');
const notificationModel = require('../models/notificationmodel');
const subredditModel = require('../models/subredditmodel');
const AppError = require('../utils/apperror');
const userModel = require('../models/usermodel');
const settingsModel = require('../models/settingsmodel');
const firebase = require('../utils/firebaseinit');


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
  await settingsModel.findByIdAndUpdate(req.user.settings, {$set: {'notificationSettings.communityAlerts.key': 'off'}}, {new: true});   //eslint-disable-line
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

exports.sendNotification = catchAsync(async (ID, msgBody, deviceToken) => {
  const message = {
    notification: {
      title: 'Threaddit',
      body: msgBody,
    },
    data: {
      userID: ID,
      screen: '/notifications',
    },
    token: deviceToken, // The FCM token of the device you want to send the notification to
  };

  firebase.messaging().send(message)
      .then((response) => {
        console.log('Successfully sent message:', response);
      })
      .catch((error) => {
        console.log('Error sending message:', error);
      });
});

exports.changeUserSettings = catchAsync(async (req, res, next) => {
  const setting = await settingsModel.findOne({_id: req.user.settings});
  await settingsModel.updateOne({_id: req.user.settings}, {
    $set: {
      [`notificationSettings.${req.body.setting}`]: !setting.notificationSettings[req.body.setting],
    },
  }, {new: true});
  res.status(200).json({
    status: 'success',
  });
});

exports.changeModSettings = catchAsync(async (req, res, next) => {
  const settings = await settingsModel.findOne({_id: req.user.settings});
  if (req.params.subredditKey === 'land of death') {
    // console.log(settings.notificationSettings);
    // console.log(settings.notificationSettings.subredditsUserMods.get(req.params.subredditKey).allowModNotifications);
  }
  if (req.params.subredditKey && !req.params.settingTab && !req.params.activityMenu && !req.params.subsetting && !req.params.number) {    //eslint-disable-line
    await settingsModel.updateOne({_id: req.user.settings}, {
      $set: {
        [`notificationSettings.subredditsUserMods.${req.params.subredditKey}.allowModNotifications`]: !settings.notificationSettings.subredditsUserMods.get(req.params.subredditKey).allowModNotifications,   //eslint-disable-line
      },
    }, {new: true});
  } else if (req.params.subredditKey && req.params.settingTab === 'activity' && !req.params.activityMenu && !req.params.subsetting && !req.params.number) {    //eslint-disable-line
    await settingsModel.updateOne({_id: req.user.settings}, {
      $set: {
        [`notificationSettings.subredditsUserMods.${req.params.subredditKey}.activity.newPosts`]: !settings.notificationSettings.subredditsUserMods.get(req.params.subredditKey).activity.newPosts,   //eslint-disable-line
      },
    }, {new: true});
  } else if (req.params.subredditKey && req.params.settingTab === 'activity' && req.params.activityMenu === 'postsWithUpvotes' && !req.params.subsetting && !req.params.number) {   // eslint-disable-line
    await settingsModel.updateOne({_id: req.user.settings}, {
      $set: {
        [`notificationSettings.subredditsUserMods.${req.params.subredditKey}.activity.postsWithUpvotes.allowNotification`]: !settings.notificationSettings.subredditsUserMods.get(req.params.subredditKey).activity.postsWithUpvotes.allowNotification,    //eslint-disable-line
      },
    }, {new: true});
  } else if (req.params.subredditKey && req.params.settingTab === 'activity' && req.params.activityMenu === 'postsWithUpvotes' && req.params.subsetting && !req.params.number) {  // eslint-disable-line
    await settingsModel.updateOne({_id: req.user.settings}, {
      $set: {
        [`notificationSettings.subredditsUserMods.${req.params.subredditKey}.activity.postsWithUpvotes.advancedSetup`]: !settings.notificationSettings.subredditsUserMods.get(req.params.subredditKey).activity.postsWithUpvotes.advancedSetup,    //eslint-disable-line
      },
    }, {new: true});
  } else if (req.params.subredditKey && req.params.settingTab === 'activity' && req.params.activityMenu === 'postsWithUpvotes' && req.params.subsetting && req.params.number) {    //eslint-disable-line
    await settingsModel.updateOne({_id: req.user.settings}, {
      $set: {
        [`notificationSettings.subredditsUserMods.${req.params.subredditKey}.activity.postsWithUpvotes.numberOfUpvotes`]: req.params.number,   //eslint-disable-line
      },
    }, {new: true});
  } else if (req.params.subredditKey && req.params.settingTab === 'activity' && req.params.activityMenu === 'postsWithComments' && !req.params.subsetting && !req.params.number) {   //eslint-disable-line
    await settingsModel.updateOne({_id: req.user.settings}, {
      $set: {
        [`notificationSettings.subredditsUserMods.${req.params.subredditKey}.activity.postsWithComments.allowNotification`]: !settings.notificationSettings.subredditsUserMods.get(req.params.subredditKey).activity.postsWithComments.allowNotification,   //eslint-disable-line
      },
    }, {new: true});
  } else if (req.params.subredditKey && req.params.settingTab === 'activity' && req.params.activityMenu === 'postsWithComments' && req.params.subsetting && !req.params.number) {  // eslint-disable-line
    await settingsModel.updateOne({_id: req.user.settings}, {
      $set: {
        [`notificationSettings.subredditsUserMods.${req.params.subredditKey}.activity.postsWithComments.advancedSetup`]: !settings.notificationSettings.subredditsUserMods.get(req.params.subredditKey).activity.postsWithComments.advancedSetup,   //eslint-disable-line
      },
    }, {new: true});
  } else if (req.params.subredditKey && req.params.settingTab === 'activity' && req.params.activityMenu === 'postsWithComments' && req.params.subsetting && req.params.number) {    //eslint-disable-line
    await settingsModel.updateOne({_id: req.user.settings}, {
      $set: {
        [`notificationSettings.subredditsUserMods.${req.params.subredditKey}.activity.postsWithComments.numberOfComments`]: req.params.number,   //eslint-disable-line
      },
    }, {new: true});
  } else if (req.params.subredditKey && req.params.settingTab === 'reports' && req.params.activityMenu === 'posts' && !req.params.subsetting && !req.params.number) {   //eslint-disable-line
    await settingsModel.updateOne({_id: req.user.settings}, {
      $set: {
        [`notificationSettings.subredditsUserMods.${req.params.subredditKey}.reports.posts.allowNotification`]: !settings.notificationSettings.subredditsUserMods.get(req.params.subredditKey).reports.posts.allowNotification,   //eslint-disable-line
      },
    }, {new: true});
  } else if (req.params.subredditKey && req.params.settingTab === 'reports' && req.params.activityMenu === 'posts' && req.params.subsetting && !req.params.number) {  // eslint-disable-line
    await settingsModel.updateOne({_id: req.user.settings}, {
      $set: {
        [`notificationSettings.subredditsUserMods.${req.params.subredditKey}.reports.posts.advancedSetup`]: !settings.notificationSettings.subredditsUserMods.get(req.params.subredditKey).reports.posts.advancedSetup,   //eslint-disable-line
      },
    }, {new: true});
  } else if (req.params.subredditKey && req.params.settingTab === 'reports' && req.params.activityMenu === 'posts' && req.params.subsetting && req.params.number) {    //eslint-disable-line
    await settingsModel.updateOne({_id: req.user.settings}, {
      $set: {
        [`notificationSettings.subredditsUserMods.${req.params.subredditKey}.reports.posts.numberOfReports`]: req.params.number,   //eslint-disable-line
      },
    }, {new: true});
  } else if (req.params.subredditKey && req.params.settingTab === 'reports' && req.params.activityMenu === 'comments' && !req.params.subsetting && !req.params.number) {   //eslint-disable-line
    await settingsModel.updateOne({_id: req.user.settings}, {
      $set: {
        [`notificationSettings.subredditsUserMods.${req.params.subredditKey}.reports.comments.allowNotification`]: !settings.notificationSettings.subredditsUserMods.get(req.params.subredditKey).reports.comments.allowNotification,   //eslint-disable-line
      },
    }, {new: true});
  } else if (req.params.subredditKey && req.params.settingTab === 'reports' && req.params.activityMenu === 'comments' && req.params.subsetting && !req.params.number) {  // eslint-disable-line
    await settingsModel.updateOne({_id: req.user.settings}, {
      $set: {
        [`notificationSettings.subredditsUserMods.${req.params.subredditKey}.reports.comments.advancedSetup`]: !settings.notificationSettings.subredditsUserMods.get(req.params.subredditKey).reports.comments.advancedSetup,   //eslint-disable-line
      },
    }, {new: true});
  } else if (req.params.subredditKey && req.params.settingTab === 'reports' && req.params.activityMenu === 'comments' && req.params.subsetting && req.params.number) {    //eslint-disable-line
    await settingsModel.updateOne({_id: req.user.settings}, {
      $set: {
        [`notificationSettings.subredditsUserMods.${req.params.subredditKey}.reports.comments.numberOfReports`]: req.params.number,    //eslint-disable-line
      },
    }, {new: true});
  }
  res.status(200).json({
    status: 'success',
  });
});
