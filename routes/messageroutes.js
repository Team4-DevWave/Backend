const express = require('express');
const messageController = require('../controllers/messagecontroller');
const authController = require('../controllers/authcontroller');
const router = express.Router();

router.use(authController.protect);
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
router
    .route('/:id')
    .get(messageController.getMessage);

module.exports = router;
