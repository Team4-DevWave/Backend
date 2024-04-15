const express = require('express');
const notificationController = require('./../controllers/notificationcontroller');
const authController = require('./../controllers/authcontroller');

// eslint-disable-next-line new-cap
const notificationRouter = express.Router();

notificationRouter.use(authController.protect);
notificationRouter
    .route('/')
    .get(notificationController.getUserNotifications);


notificationRouter.patch('/hide/:notification_id', notificationController.hideNotification);
notificationRouter.patch('/disable_updates/:subreddit_name', notificationController.disableSubredditUpdates);
notificationRouter
    .route('/mark_all_read')
    .patch(notificationController.markAllAsRead);
notificationRouter
    .route('/read/:notification_id')
    .patch(notificationController.markRead);
notificationRouter
    .route('/settings')
    .get(notificationController.getNotificationSettings);


module.exports = notificationRouter;
