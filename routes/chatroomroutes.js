const authcontroller = require('../controllers/authcontroller');
const chatroomcontroller = require('../controllers/chatroomcontroller');
const chatMessageRouter = require('./chatmessageroutes');
const express = require('express');
// eslint-disable-next-line new-cap
const chatroomRouter = express.Router();
chatroomRouter.use('/:chatroomid/messages', chatMessageRouter);

chatroomRouter.use(authcontroller.protect);

chatroomRouter.route('/')
    .post(chatroomcontroller.createChatroom)
    .get(chatroomcontroller.getChatrooms);
chatroomRouter.route('/:chatroomid')
    .get(chatroomcontroller.getChatroom)
    .delete(chatroomcontroller.deleteChatroom);
chatroomRouter.patch('/:chatroomid/rename', chatroomcontroller.renameChatroom);
chatroomRouter.post('/:chatroomid/addmember', chatroomcontroller.addMember);
chatroomRouter.delete('/:chatroomid/removemember', chatroomcontroller.removeMember);
