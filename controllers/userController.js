const userModel = require("../models/usermodel");
const AppError = require("../utils/apperror");
const catchAsync = require("../utils/catchasync");
const handlerFactory = require("./handlerfactory");

exports.usernameAvailable = catchAsync(async (req, res, next) => {
  const users = await userModel.find({ username: req.params.username });
  res.status(200).json({
    status: "success",
    data: {
      users: users,
      available: users.length === 0,
    },
  });
});

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.getUser = handlerFactory.getOne(userModel);

exports.getMySettings = catchAsync(async (req, res, next) => {
  const user = await userModel.findById(req.user.id);
  res.status(200).json({
    status: "success",
    data: {
      user: user.settings,
    },
  });
});

exports.updateMySettings = catchAsync(async (req, res, next) => {
  const user = await userModel.findByIdAndUpdate(req.user.id, req.body);
  res.status(200).json({
    status: "success",
    data: {
      user: user,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await userModel.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.addFriend = catchAsync(async (req, res, next) => {});
exports.removeFriend = catchAsync(async (req, res, next) => {});
exports.blockUser = catchAsync(async (req, res, next) => {});
exports.unblockUser = catchAsync(async (req, res, next) => {});
exports.getUserByUsername = catchAsync(async (req, res, next) => {});
