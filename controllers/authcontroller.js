const {promisify} = require('util');
const crypto = require('crypto');
const userModel = require('./../models/usermodel');
const settingsModel = require('./../models/settingsmodel');
// making a user requires settings
const catchAsync = require('./../utils/catchasync');
const jwt = require('jsonwebtoken');
const AppError = require('./../utils/apperror');
const mailControl = require('./../nodemailer-gmail/mailcontrols');
const signToken = (id) => {
  return jwt.sign(
      {
        userID: id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN,
      },
  );
};
const sendVerificationEmail = (user) => {
  if (user.verfied) {
    return;
  }
  const Token = crypto.randomBytes(32).toString('hex');
  user.verificationToken = Token;
  mailControl.sendEmail(
      user.email,
      'Welcome to Reddit',
      'Welcome to Reddit,please click the link to verify your email: http://localhost:8000/api/v1/users/verify/' +
      user.username +
      '/' +
      Token,
  ); // TODO modify link when hosting
  return Token;
};
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};
exports.login = catchAsync(async (req, res, next) => {
  const {email} = req.body;
  const {password} = req.body;
  const {username} = req.body;
  // 1) check if email and pass exist
  if (!password) {
    return next(new AppError('Please provide password', 400));
  }
  if (!email || !username) {
    return next(new AppError('Please provide email/username', 400));
  }
  // 2) check if user exists and password is correct
  let user;
  if (email) {
    user = await userModel.findOne({email: email}).select('+password'); // select + is used to show hidden entity
  } else {
    user = await userModel.findOne({username: username}).select('+password'); // select + is used to show hidden entity
  }

  // to compare the password with the encrypted password on DB then encrypt the req pass and compare it with the encrypted one is DB , the function created to do so is found in usermodel as it's related to the data. that function is called correctpassword
  if (!user || !(await user.correctPassword(password, user.password))) {
    console.log('yo');
    return next(new AppError('Incorrect email or password'), 401);
  }
  // 3) if everything is okay , send token to client
  createSendToken(user, 200, res);
});
exports.protect = catchAsync(async (req, res, next) => {
  let token;
  // console.log(req.headers.authorization);
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return next(
        new AppError('you are not logged in! please log in to gain access', 401),
    );
  }
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const user = await userModel.findById(decoded.userID);
  if (!user) {
    return next(
        new AppError(
            'the user belonging to this token does no longer exist ',
            401,
        ),
    );
  }
  if (user.changedPasswordsAfter(decoded.iat)) {
    return next(
        new AppError('user recently changed password, please log in again', 401),
    );
  }
  req.user = user;
  next();
});
exports.signup = catchAsync(async (req, res, next) => {
  // mailControl.sendEmail(req.body.email,"Welcome to Reddit","Welcome to Reddit,please click the link to verify your email: http://localhost:3000/verify/"+req.body.username+"/123"); //TODO modify link when hosting
  let user = await userModel.findOne({username: req.body.username});
  if (user) {
    return next(new AppError('username is taken', 401));
  }
  user = await userModel.findOne({email: req.body.email});
  if (user) {
    return next(new AppError('email already used', 401));
  }
  if (!req.body.passwordConfirm) {
    return next(new AppError('password confirm is required', 401));
  }
  const settings = await settingsModel.create({});

  const newUser = await userModel.create(req.body);
  newUser.verified = false;
  newUser.settings = settings._id;

  const token = sendVerificationEmail(newUser); // TODO move under user.save
  newUser.verficationToken = token;
  await newUser.save();

  createSendToken(newUser, 201, res);
});
exports.verifyEmail = catchAsync(async (req, res, next) => {
  const user = await userModel.findOne({username: req.params.username});
  if (!user) {
    return next(new AppError('user not found', 401));
  }
  if (user.verificationToken !== req.params.token) {
    return next(new AppError('invalid token', 401));
  }
  user.verified = true;
  user.verificationToken = undefined;
  await user.save();
  res.status(200).json({
    status: 'success',
    message: 'email verified',
  });
});
