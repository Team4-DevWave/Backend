const authcontroller = require('../controllers/authcontroller');
const chatMessageController = require('../controllers/chatmessagecontroller');
const express = require('express');
// eslint-disable-next-line new-cap
const chatMessageRouter = express.Router();

chatMessageRouter.use(authcontroller.protect);
chatMessageRouter.route('/')
    .post(chatMessageController.createChatMessage)// send message
    .get(chatMessageController.getChatMessages);// get messages
chatMessageRouter.route('/:chatmessageid')
    .get(chatMessageController.getChatMessage)
    .delete(chatMessageController.deleteChatMessage);
chatMessageRouter.patch('/:chatmessageid/edit', chatMessageController.editChatMessage);
module.exports = chatMessageRouter;

