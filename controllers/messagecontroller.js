const messageModel = require('../models/messagesmodel');
const AppError = require('../utils/apperror');
const catchAsync = require('../utils/catchasync');
const handlerFactory = require('./handlerfactory');
const userModel = require('../models/usermodel');

exports.getSent = handlerFactory.getAll(messageModel, (req) => ({from: req.user.id}));
exports.getInbox = handlerFactory.getAll(messageModel, (req) => ({to: req.user.id}));
exports.getUnread = handlerFactory.getAll(messageModel, (req) => ({to: req.user.id, read: false}));
exports.getMessage = handlerFactory.getOne(messageModel);
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
exports.markAllRead = catchAsync(async (req, res, next) => {
  await messageModel.updateMany({to: req.user.id}, {read: true});
  res.status(200).json({
    status: 'success',
  });
});
exports.markReadMessage = catchAsync(async (req, res, next) => {
  const message = await messageModel.findById(req.params.id);
  if (!message) {
    return next(new AppError('no message with that id', 404));
  }
  if (message.to !== req.user.id) {
    return next(new AppError('you are not allowed to mark this message as read', 403));
  }
  message.read = !message.read;
  await message.save();
  res.status(200).json({
    status: 'success',
    data: {
      message,
    },
  });
});
exports.reportMessage = catchAsync(async (req, res, next) => {
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
