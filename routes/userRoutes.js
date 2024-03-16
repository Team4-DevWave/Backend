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
userRouter.get('/:username/posts', userController.getPosts);
userRouter.get('/:username/comments', userController.getComments);
userRouter.get('/:username/overview', userController.getOverview);
userRouter.get('/:username/about', userController.getAbout);
userRouter.use(authController.protect);
userRouter.get('/:username/saved', userController.getSaved);
userRouter.get('/:username/hidden', userController.gethiddenPosts);
userRouter.get('/:username/upvoted', userController.getUpvoted);
userRouter.get('/:username/downvoted', userController.getDownvoted);
userRouter.post('/changepassword', authController.updatePassword);
// routes that need protection

module.exports = userRouter;
