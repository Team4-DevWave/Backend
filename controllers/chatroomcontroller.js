// const messageModel = require('../models/messageModel');
const chatroomModel = require('../models/chatroommodel');
const userModel = require('../models/usermodel');
const catchAsync = require('../utils/catchasync');
const AppError = require('../utils/apperror');

exports.createChatroom = catchAsync(async (req, res, next) => {
  const chatroomMembers=req.body.chatroomMembers;
  if (!chatroomMembers) {
    return next(new AppError('Chatroom members are required', 400));
  }
  const defaultChatname = chatroomMembers.length > 1 ? 'New Group Chat' : 'New Chat';
  const chatroomName = req.body.chatroomName || defaultChatname;
  const members = (await userModel.find({
    username: {$in: chatroomMembers}}, 'id')).map((doc) => doc._id);
  if (members.length !== chatroomMembers.length) {
    return next(new AppError('Some members do not exist', 400));
  }
  const isGroup=chatroomMembers.length>1? true:false;
  members.push(req.user._id);
  // Check if a direct message chatroom already exists between the current user and the other member
  if (!isGroup && members.length === 2) {
    const existingChatroom = await chatroomModel.findOne({
      chatroomMembers: {$all: members},
      isGroup: false,
    });
    if (existingChatroom) {
      return next(new AppError('A direct message chatroom already exists with this member', 400));
    }
  }
  const chatroom = await chatroomModel.create({
    chatroomAdmin: req.user._id,
    chatroomName: chatroomName,
    chatroomMembers: members,
    isGroup: isGroup,
  });
  res.status(201).json({
    status: 'success',
    data: {
      chatroom,
    },
  });
});

exports.getChatrooms = catchAsync(async (req, res, next) => {
  const chatrooms = await chatroomModel.find({chatroomMembers: req.user._id})
      .populate('latestMessage');
  res.status(200).json({
    status: 'success',
    data: {
      chatrooms,
    },
  });
});

exports.getChatroom = catchAsync(async (req, res, next) => {
  const chatroom = await chatroomModel.findById(req.params.chatroomid)
      .populate('latestMessage');
  if (!chatroom) {
    return next(new AppError('Chatroom not found', 404));
  }
  // TODO GET ALL MESSAGES IN CHATROOM
  res.status(200).json({
    status: 'success',
    data: {
      chatroom,
    },
  });
});

exports.deleteChatroom = catchAsync(async (req, res, next) => {
  const chatroom = await chatroomModel.findOne({_id: req.params.chatroomid, chatroomAdmin: req.user._id});
  if (!chatroom) {
    return next(new AppError('Chatroom not found', 404));
  }
  await chatroomModel.deleteOne({
    _id: req.params.chatroomid});
  res.status(204).json({
    status: 'success',
  });
});

exports.renameChatroom = catchAsync(async (req, res, next) => {
  const chatroom = await chatroomModel.findOneAndUpdate(
      {_id: req.params.chatroomid, chatroomAdmin: req.user._id},
      {chatroomName: req.body.chatroomName},
      {new: true});
  if (!chatroom) {
    return next(new AppError('Chatroom not found', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      chatroom,
    },
  });
});

exports.addMember = catchAsync(async (req, res, next) => {
  const member = await userModel.find({username: {$in: req.body.member}}, '_id');
  if (!member) {
    return next(new AppError('member does not exist', 400));
  }
  const chatroom = await chatroomModel.findOneAndUpdate(
      {_id: req.params.chatroomid, chatroomAdmin: req.user._id},
      {$addToSet: {chatroomMembers: member[0]._id}},
      {new: true});
  if (!chatroom) {
    return next(new AppError('Chatroom not found', 404));
  }
  if (chatroom.chatroomAdmin._id.toString() !== req.user._id.toString()) {
    return next(new AppError('You cannot add member to this chat', 401));
  }
  const isGroup=chatroom.chatroomMembers.length>2? true:false;
  chatroom.isGroup=isGroup;
  chatroom.save();
  res.status(200).json({
    status: 'success',
    data: {
      chatroom,
    },
  });
});

exports.removeMember = catchAsync(async (req, res, next) => {
  const member = await userModel.find({username: req.body.member}, '_id');
  if (!member) {
    return next(new AppError('member does not exist', 400));
  }
  const chatroom = await chatroomModel.findOneAndUpdate(
      {_id: req.params.chatroomid, chatroomAdmin: req.user._id},
      {$pull: {chatroomMembers: member[0]._id}},
      {new: true});
  if (!chatroom) {
    return next(new AppError('Chatroom not found', 404));
  }
  if (chatroom.chatroomAdmin._id.toString() !== req.user._id.toString()) {
    return next(new AppError('You cannot add member to this chat', 401));
  }
  const isGroup=chatroom.chatroomMembers.length>2? true:false;
  chatroom.isGroup=isGroup;
  chatroom.save();
  res.status(200).json({
    status: 'success',
    data: {
      chatroom,
    },
  });
});


