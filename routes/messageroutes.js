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
    .route('/inbox') // same as get all messages
    .get(messageController.getAllInbox);
router
    .route('/sent')
    .get(messageController.getAllSent);
router
    .route('/unread')
    .get(messageController.getAllUnread);
router
    .route('/postreply')
    .get(messageController.getAllPostReply);
router
    .route('/mentions')
    .get(messageController.getAllMentions);
router
    .route('/messages')
    .get(messageController.getAllMessages);
router
    .route('/markallread')
    .patch(messageController.markAllRead);
router
    .route('/:id')
    .get(messageController.getMessage);
router
    .route('/:id/markread') // mark message as read/unread
    .patch(messageController.toggleReadMessage);
router
    .route('/:id/delete')
    .delete(messageController.deleteMessage);
router
    .route('/:id/report')
    .post(messageController.reportMessage);
module.exports = router;
