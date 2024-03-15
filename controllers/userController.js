const userModel = require('../models/usermodel');
const AppError = require('../utils/apperror');
const catchAsync = require('../utils/catchasync');
const handlerFactory = require('./handlerfactory');
const settingsModel = require('../models/settingsmodel');

const handleUserAction = (action, subaction) =>
  catchAsync(async (req, res, next) => {
    const targetUser = await userModel.findOne({username: req.params.username});
    if (!targetUser) {
      return next(new AppError('No user with that username', 404));
    }
    const currentUser = await userModel.findById(req.user.id);
    const actionField = action + 'edUsers';
    const userExist = currentUser[actionField].includes(targetUser._id);
    if (userExist && subaction === 'add') {
      return next(new AppError(`You have already ${action}ed this user`, 400));
    } else if (!userExist && subaction === 'remove') {
      return next(new AppError(`You haven't ${action}ed this user`, 400));
    }
    const updateOperation = subaction === 'add' ? '$addToSet' : '$pull';
    const updatedUser = await userModel.findByIdAndUpdate(req.user.id, {
      [updateOperation]: {[actionField]: targetUser._id},
    }, {new: true});
    updatedUser.save();
    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser,
      },
    });
  });

exports.usernameAvailable = catchAsync(async (req, res, next) => {
  const users = await userModel.find({username: req.params.username});
  res.status(200).json({
    status: 'success',
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
  const user = await userModel.findById(req.user.id).populate('settings');
  res.status(200).json({
    status: 'success',
    data: {
      user: user.settings,
    },
  });
});

exports.updateMySettings = handlerFactory.updateOne(settingsModel);
exports.setSettingsId = (req, res, next) => {
  req.params.id = req.user.settings;
  next();
};
// exports.updateMySettings = catchAsync(async (req, res, next) => {
//   const user=await userModel.findById(req.user.id);
//   const userSettings = await settingsModel.findByIdAndUpdate(user.settings, {$set: req.body}, {new: true});
//   console.log(userSettings);
//   res.status(200).json({
//     status: 'success',
//     data: {
//       user: userSettings,
//     },
//   });
// });

exports.deleteMe = catchAsync(async (req, res, next) => {
  await userModel.findByIdAndUpdate(req.user.id, {active: false});
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.addFriend = handleUserAction('follow', 'add');
exports.removeFriend =handleUserAction('follow', 'remove');
exports.blockUser = handleUserAction('block', 'add');
exports.unblockUser = handleUserAction('block', 'remove');

exports.getUserByUsername = catchAsync(async (req, res, next) => {
  // Your logic for getting a user by username goes here
  res.status(200).json({
    status: 'success',
    data: {
      message: 'User fetched successfully',
    },
  });
});

exports.unfollowBlockedUser=catchAsync(async (req, res, next) => {
  const user =await userModel.findById(req.user.id);
  const blockUser= await userModel.findOne({username: req.params.username});
  if (user.followedUsers.includes(blockUser._id)) {
    user.followedUsers.pull(blockUser._id);
    await user.save();
  }
  next();
});

exports.checkBlocked=catchAsync(async (req, res, next) => {
  const user =await userModel.findById(req.user.id);
  const followUser= await userModel.findOne({username: req.params.username});
  if (user.blockedUsers.includes(followUser._id)) {
    return next(new AppError('You have blocked this user', 400));
  }
  next();
});
