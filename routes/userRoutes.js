const express = require('express');
const userController = require('../controllers/usercontroller');
const authController = require('../controllers/authcontroller');
const userRouter = express.Router();

userRouter.post('/signup', authController.signup);
userRouter.post('/login', authController.login);
userRouter.get('/verify/:username/:token', authController.verifyEmail);
userRouter.get('/check/:username', userController.usernameAvailable);
userRouter.post('/forgotPassword', authController.forgotPassword);
userRouter.patch('/resetPassword/:token', authController.resetPassword);
userRouter.use(authController.protect);
userRouter.post('/changepassword', authController.updatePassword);
// routes that need protection

module.exports = userRouter;
