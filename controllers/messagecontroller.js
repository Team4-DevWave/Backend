const messageModel = require('../models/messagesmodel');
const AppError = require('../utils/apperror');
const catchAsync = require('../utils/catchasync');
const userModel = require('../models/usermodel');
const paginate = require('../utils/paginate');

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
      newMessage,
    },
  });
});

exports.getAllInbox = catchAsync(async (req, res, next) => {
  const pageNumber=req.query.page || 1;
  const messages = paginate.paginate(await messageModel.find({to: req.user.id}).sort({createdAt: -1}), 10, pageNumber);
  res.status(200).json({
    status: 'success',
    data: {
      messages,
    },
  });
});

exports.getAllSent = catchAsync(async (req, res, next) => {
  const pageNumber=req.query.page || 1;
  const messages = paginate.paginate(await messageModel.find({
    from: req.user.id,
    subject: {$nin: ['username mention', 'post reply']}}).sort({createdAt: -1}), 10, pageNumber);
  res.status(200).json({
    status: 'success',
    data: {
      messages,
    },
  });
});

exports.getAllUnread = catchAsync(async (req, res, next) => {
  const pageNumber=req.query.page || 1;
  const messages = paginate.paginate(await messageModel.find({
    to: req.user.id, read: false}).sort({createdAt: -1}), 10, pageNumber);
  res.status(200).json({
    status: 'success',
    data: {
      messages,
    },
  });
});

exports.getAllPostReply = catchAsync(async (req, res, next) => {
  const pageNumber=req.query.page || 1;
  const messages = paginate.paginate(await messageModel.find({
    to: req.user.id, subject: {$in: ['post reply']}}).sort({createdAt: -1}), 10, pageNumber);
  res.status(200).json({
    status: 'success',
    data: {
      messages,
    },
  });
});

exports.getAllMentions = catchAsync(async (req, res, next) => {
  const pageNumber=req.query.page || 1;
  const messages = paginate.paginate(await messageModel.find({
    to: req.user.id, subject: {$in: ['username mention']}}).sort({createdAt: -1}), 10, pageNumber);
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
  if (message.to.toString() !== req.user.id.toString() && message.from.toString() !== req.user.id.toString()) {
    return next(new AppError('you are not allowed to access this message', 403));
  }
  res.status(200).json({
    status: 'success',
    data: {
      message,
    },
  });
});

exports.deleteMessage =catchAsync(async (req, res, next) => {
  const message = await messageModel.findByIdAndDelete(req.params.id);
  if (!message) {
    return next(new AppError('no message with that id', 404));
  }
  if (message.to.toString() !== req.user.id.toString() && message.from.toString() !== req.user.id.toString()) {
    return next(new AppError('you are not allowed to delete this message', 403));
  }
  // await message.remove();
  res.status(204).json({
    status: 'success',
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
  message.read = !message.read;
  await message.save();
  res.status(200).json({
    status: 'success',
  });
});

