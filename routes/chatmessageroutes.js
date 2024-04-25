const authcontroller = require('../controllers/authcontroller');
const chatMessageController = require('../controllers/chatroomcontroller');
const express = require('express');
// eslint-disable-next-line new-cap
const chatMessageRouter = express.Router({mergeParams: true});

chatMessageRouter.use(authcontroller.protect);

chatMessageRouter.route('/')
    .post(chatMessageController.createChatMessage)// send message
    .get(chatMessageController.getChatMessages);// get messages
chatMessageRouter.route('/:chatmessageid')
    .get(chatMessageController.getChatMessage)
    .delete(chatMessageController.deleteChatMessage);
chatMessageRouter.patch('/:chatmessageid/edit', chatMessageController.editChatMessage);

