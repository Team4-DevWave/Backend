const chatMessageModel = require('../models/chatmessagemodel');
const catchAsync = require('../utils/catchasync');
const AppError = require('../utils/apperror');
const chatroomModel = require('../models/chatroommodel');

exports.createChatMessage = catchAsync(async (req, res, next) => {
  const chatroom = await chatroomModel.findById(req.params.chatroomid);
  if (!chatroom) {
    return next(new AppError('No chatroom found with that ID', 404));
  }
  const chatroomMembers = chatroom.chatroomMembers.map((member) => member._id.toString());
  if (!chatroomMembers.includes(req.user.id)) {
    return next(new AppError('You are not a member of this chatroom', 401));
  }
  const chatMessage = await chatMessageModel.create({
    sender: req.user._id,
    message: req.body.message,
    chatID: chatroom._id,
  });
  chatroom.latestMessage = chatMessage._id;
  await chatroom.save();
  res.status(201).json({
    status: 'success',
    data: {
      chatMessage,
    },
  });
});

exports.getChatMessages = catchAsync(async (req, res, next) => {
  const chatroom = await chatroomModel.findById(req.params.chatroomid);
  if (!chatroom) {
    return next(new AppError('No chatroom found with that ID', 404));
  }
  const chatroomMembers = chatroom.chatroomMembers.map((member) => member._id.toString());
  if (!chatroomMembers.includes(req.user.id)) {
    return next(new AppError('You are not a member of this chatroom', 401));
  }
  const chatMessages = await chatMessageModel.find({chatID: chatroom._id});
  res.status(200).json({
    status: 'success',
    data: {
      chatMessages,
    },
  });
});

exports.getChatMessage = catchAsync(async (req, res, next) => {
  const chatMessage = await chatMessageModel.findById(req.params.chatmessageid);
  if (!chatMessage) {
    return next(new AppError('No chat message found with that ID', 404));
  }
  const chatroom = await chatroomModel.findById(chatMessage.chatID);
  const chatroomMembers = chatroom.chatroomMembers.map((member) => member._id.toString());
  if (!chatroomMembers.includes(req.user.id)) {
    return next(new AppError('You are not a member of this chatroom', 401));
  }
  res.status(200).json({
    status: 'success',
    data: {
      chatMessage,
    },
  });
});

exports.deleteChatMessage = catchAsync(async (req, res, next) => {
  const chatMessage = await chatMessageModel.findById(req.params.chatmessageid);
  if (!chatMessage) {
    return next(new AppError('No chat message found with that ID', 404));
  }
  const chatroom = await chatroomModel.findById(chatMessage.chatID);
  const chatroomMembers = chatroom.chatroomMembers.map((member) => member._id.toString());
  if (!chatroomMembers.includes(req.user.id)) {
    return next(new AppError('You are not a member of this chatroom', 401));
  }
  if (chatroom.latestMessage.toString() === chatMessage._id.toString()) {
    chatroom.latestMessage = null;
    await chatroom.save();
  }
  await chatMessageModel.findByIdAndDelete({
    _id: req.params.chatmessageid,
    sender: req.user._id,
  });
  res.status(204).json({
    status: 'success',
  });
});

exports.editChatMessage = catchAsync(async (req, res, next) => {
  const chatMessage = await chatMessageModel.findById({
    _id: req.params.chatmessageid,
    sender: req.user._id,
  });
  if (!chatMessage) {
    return next(new AppError('No chat message found with that ID', 404));
  }
  chatMessage.message = req.body.message;
  await chatMessage.save();
  res.status(200).json({
    status: 'success',
    data: {
      chatMessage,
    },
  });
});
