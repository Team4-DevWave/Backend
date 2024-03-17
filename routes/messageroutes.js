const express = require('express');
const messageController = require('../controllers/messagecontroller');
const authController = require('../controllers/authcontroller');
// eslint-disable-next-line
const router = express.Router();

router.use(authController.protect);
router
    .route('/compose')
    .post(messageController.createMessage);
router
    .route('/inbox')
    .get(messageController.getInbox);
router
    .route('/sent')
    .get(messageController.getSent);
router
    .route('/unread')
    .get(messageController.getUnread);
router
    .route('/markAllRead')
    .patch(messageController.markAllRead);
router
    .route('/:id')
    .get(messageController.getMessage)
    .patch(messageController.markReadMessage);
router
    .route('/:id/report')
    .post(messageController.reportMessage);
module.exports = router;
