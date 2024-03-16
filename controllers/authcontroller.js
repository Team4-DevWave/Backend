const {promisify} = require('util');
const crypto = require('crypto');
const userModel = require('./../models/usermodel');
const settingsModel = require('./../models/settingsmodel');
// making a user requires settings
const catchAsync = require('./../utils/catchasync');
const jwt = require('jsonwebtoken');
const Apperror = require('./../utils/apperror');
const mailControl = require('./../nodemailer-gmail/mailcontrols');
const signToken=(id)=>{
  return jwt.sign({
    'userID': id,
  }, process.env.JWT_SECRET,
  {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
const sendVerificationEmail=(user)=>{
  if (user.verfied) {
    return;
  }
  const Token = crypto.randomBytes(32).toString('hex');
  user.verificationToken=Token;
  mailControl.sendEmail(user.email, 'Welcome to Reddit',
      'Welcome to Reddit,please click the link to verify your email: http://localhost:8000/api/v1/users/verify/'+
  user.username+'/'+Token); // TODO modify link when hosting
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
  const email = req.body.email;
  const password = req.body.password;
  const username = req.body.username;
  // 1) check if email and pass exist
  if (!password) {
    return next(new Apperror('Please provide password', 400));
  }
  if (!email || !username) {
    return next(new Apperror('Please provide email/username', 400));
  }
  // 2) check if user exists and password is correct
  let user;
  if (email) {
    user = await userModel.findOne({email: email}).select('+password');
  } else {
    user = await userModel.findOne({username: username}).select('+password');
  }

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new Apperror('Incorrect email or password'), 401);
  }
  // 3) if everything is okay , send token to client
  createSendToken(user, 200, res);
});
exports.forgotPassword = catchAsync(async (req, res, next) => {
  const username = req.body.username;
  const email = req.body.email;
  if (!email || !username) {
    return next(new Apperror('Please provide email/username', 400));
  }
  const user = await userModel.findOne({email: email, username: username});
  if (!user) {
    return next(new Apperror('User not found', 400));
  }
  if (!user.verified) {
    return next(new Apperror('User not verified', 400));
  }
  const resetToken = user.createPasswordResetToken();
  await user.save({validateBeforeSave: false});
  mailControl.sendEmail(
      email,
      `Hello ${username}`,
      'If you forgot your password please click the link if not please ignore' +
      +'http://localhost:8000/api/v1/users/resetpassword/'+ resetToken,
  );
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  const token = req.params.token;
  const password = req.body.password;
  const passwordConfirm = req.body.passwordConfirm;
  if (!password || !passwordConfirm) {
    return next(new Apperror('Please provide password and passwordConfirm', 400));
  }
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await userModel.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: {$gt: Date.now()},
  });
  if (!user) {
    return next(new Apperror('Token is invalid or has expired', 400));
  }
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.password = password;
  user.passwordConfirm = passwordConfirm;
  await user.save();
  createSendToken(user, 200, res);
});
exports.updatePassword=catchAsync(async (req, res, next)=>{
  const currentPassword=req.body.currentPassword;
  const newPassword=req.body.newPassword;
  const passwordConfirm=req.body.passwordConfirm;
  if (!currentPassword || !newPassword || !passwordConfirm) {
    return next(new Apperror('Please provide all fields', 400));
  }
  const user=await userModel.findById(req.user.id).select('+password');
  if (!user) {
    return next(new Apperror('User not found', 400));
  }
  if (!(await user.correctPassword(currentPassword, user.password))) {
    return next(new Apperror('Password is incorrect', 400));
  }
  user.password=newPassword;
  user.passwordConfirm=passwordConfirm;
  await user.save();
  createSendToken(user, 200, res);
});
exports.protect = catchAsync(async (req, res, next) => {
  let token;
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
        new Apperror('you are not logged in! please log in to gain access', 401),
    );
  }
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const user = await userModel.findById(decoded.userID);
  if (!user) {
    return next(
        new Apperror(
            'the user belonging to this token does no longer exist ',
            401,
        ),
    );
  }
  if (user.changedPasswordsAfter(decoded.iat)) {
    return next(
        new Apperror('user recently changed password, please log in again', 401),
    );
  }
  req.user = user;
  console.log('passed the protect middleware');
  next();
});
exports.signup = catchAsync(async (req, res, next) => {
  let user=await userModel.findOne({username: req.body.username});
  if (user) {
    return next(new Apperror('username is taken', 401));
  }
  user = await userModel.findOne({email: req.body.email});
  if (user) {
    return next(new Apperror('email already used', 401));
  }
  if (!req.body.passwordConfirm) {
    return next(new Apperror('password confirm is required', 401));
  }
  const interests = req.body.interests;
  const country = req.body.country;
  const email = req.body.email;
  const username = req.body.username;
  const password = req.body.password;
  const passwordConfirm = req.body.passwordConfirm;
  const gender= req.body.gender;
  if (!interests || !email || !username || !password || !passwordConfirm) {
    return next(new Apperror('Please provide all fields', 400));
  }
  const settings = await settingsModel.create({});
  const newUser = await userModel.create({username: username, interests: interests, country: country?country:'',
    gender: gender?gender:'I prefer not to say', email: email, password: password, passwordConfirm: passwordConfirm});
  newUser.verified=false;
  newUser.settings = settings._id;

  const token=sendVerificationEmail(newUser); // TODO move under user.save
  newUser.verficationToken=token;
  await newUser.save();

  createSendToken(newUser, 201, res);
});
exports.verifyEmail = catchAsync(async (req, res, next) => {
  const user=await userModel.findOne({username: req.params.username});
  if (!user) {
    return next(new Apperror('user not found', 401));
  }
  if (user.verificationToken!==req.params.token) {
    return next(new Apperror('invalid token', 401));
  }
  user.verified=true;
  user.verificationToken=undefined;
  await user.save();
  res.status(200).json({
    status: 'success',
    message: 'email verified',
  });
});
