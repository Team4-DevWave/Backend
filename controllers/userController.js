const userModel = require('../models/usermodel');
const Apperror = require('../utils/apperror');
const catchAsync = require('../utils/catchasync');
exports.usernameAvailable=catchAsync(async (req, res, next)=>{
  if (!req.params.username) {
    return next(new Apperror('Please provide a username', 400));
  }
  const username=req.params.username;
  const user=await userModel.findOne({username: username});
  if (user) {
    return next(new Apperror('Username not available', 400));
  }
  res.status(200).json({
    status: 'success',
    message: 'Username available',
  });
});
