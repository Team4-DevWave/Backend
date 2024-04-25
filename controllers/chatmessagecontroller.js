const chatMessageModel = require('../models/chatmessagemodel');
const catchAsync = require('../utils/catchasync');
const AppError = require('../utils/apperror');
const chatroomModel = require('../models/chatroommodel');

exports.createChatMessage = catchAsync(async (req, res, next) => {
  const chatroom = await chatroomModel.findById(req.params.chatroomid);
  if (!chatroom) {
    return next(new AppError('No chatroom found with that ID', 404));
  }
  const chatMessage = await chatMessageModel.create({
    sender: req.user._id,
    message: req.body.message,
    chatID: chatroom._id,
  });
  // .populate( {
  //   path: 'chatroomMembers',
  //   select: 'username profilePicture',
  //   model: 'users',
  // });
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
