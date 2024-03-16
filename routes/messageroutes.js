const express = require('express');
const messageController = require('../controllers/messagecontroller');
const authController = require('../controllers/authcontroller');
// eslint-disable-next-line new-cap
const router = express.Router();

router.use(authController.protect);
router
    .route('/:id')
    .get(messageController.getMessage);
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
    .route('/compose')
    .post(messageController.createMessage);

module.exports = router;
