const messageModel = require('../models/messagesmodel');
const AppError = require('../utils/apperror');
const catchAsync = require('../utils/catchasync');
// const handlerFactory = require('./handlerfactory');
const userModel = require('../models/usermodel');

exports.createMessage = catchAsync(async (req, res, next) => {
  req.body.from===''?req.body.from = req.user.id: req.body.from;
  req.body.to = (await userModel.findOne({username: req.body.to}))._id;
  if (!req.body.to) {
    return next(new AppError('no user with that username', 404));
  }
  const newMessage = await messageModel.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      data: newMessage,
    },
  });
});

exports.getAllInbox = catchAsync(async (req, res, next) => {
  const messages = await messageModel.find({to: req.user.id});
  res.status(200).json({
    status: 'success',
    data: {
      messages,
    },
  });
});

exports.getAllSent = catchAsync(async (req, res, next) => {
  const messages = await messageModel.find({
    from: req.user.id,
    subject: {$nin: ['username mention', 'post reply']}});
  res.status(200).json({
    status: 'success',
    data: {
      messages,
    },
  });
});

exports.getAllUnread = catchAsync(async (req, res, next) => {
  const messages = await messageModel.find({to: req.user.id, read: false});
  res.status(200).json({
    status: 'success',
    data: {
      messages,
    },
  });
});

exports.getAllPostReply = catchAsync(async (req, res, next) => {
  const messages = await messageModel.find({to: req.user.id, subject: {$in: ['post reply']}});
  res.status(200).json({
    status: 'success',
    data: {
      messages,
    },
  });
});

exports.getAllMentions = catchAsync(async (req, res, next) => {
  const messages = await messageModel.find({to: req.user.id, subject: {$in: ['username mention']}});
  res.status(200).json({
    status: 'success',
    data: {
      messages,
    },
  });
});

exports.markAllRead = catchAsync(async (req, res, next) => {
  await messageModel.updateMany({to: req.user.id}, {read: true});
  res.status(200).json({
    status: 'success',
  });
});

exports.getMessage = catchAsync(async (req, res, next) => {
  const message = await messageModel.findById(req.params.id);
  if (!message) {
    return next(new AppError('no message with that id', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      message,
    },
  });
});

exports.deleteMessage =catchAsync(async (req, res, next) => {
  const message = await messageModel.findById(req.params.id);
  if (!message) {
    return next(new AppError('no message with that id', 404));
  }
  if (message.to.toString() !== req.user.id.toString()) {
    return next(new AppError('you are not allowed to delete this message', 403));
  }
  await message.remove();
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.reportMessage = catchAsync(async (req, res, next) => { // NEED ADMIN OR MODERATION
  const message = await messageModel.findById(req.params.id);
  if (!message) {
    return next(new AppError('no message with that id', 404));
  }// TO DO
  res.status(200).json({
    status: 'success',
    data: {
      message,
    },
  });
});

exports.toggleReadMessage = catchAsync(async (req, res, next) => {
  const message = await messageModel.findById(req.params.id);
  if (!message) {
    return next(new AppError('no message with that id', 404));
  }
  // if (message.to.toString() !== req.user.id ) {
  //   return next(new AppError('you are not allowed to mark this message as read', 403));
  // }
  message.read = !message.read;
  await message.save();
  res.status(200).json({
    status: 'success',
    data: {
      message,
    },
  });
});

