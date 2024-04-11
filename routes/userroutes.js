const express = require('express');
const userController = require('../controllers/usercontroller');
const authController = require('../controllers/authcontroller');
// eslint-disable-next-line new-cap
const userRouter = express.Router();
userRouter.post('/signup', authController.signup);// TESTED
userRouter.post('/login', authController.login);// TESTED
userRouter.post('/forgotUsername', authController.forgotUsername);// TESTED
userRouter.get('/googleLogin', authController.googleLogin);
userRouter.post('/googleSignup', authController.googleSignup);
userRouter.get('/verify/:username/:token', authController.verifyEmail);
userRouter.get('/check/:username', userController.usernameAvailable);// TESTED
userRouter.post('/forgotPassword', authController.forgotPassword);
userRouter.post('/resetPassword/', authController.resetPassword);
userRouter.get('/:username/posts', userController.getPosts);// TESTED
userRouter.get('/:username/comments', userController.getComments);// TESTED
userRouter.get('/:username/overview', userController.getOverview);// TESTED
userRouter.get('/:username/about', userController.getAbout); // might not need // TESTED
userRouter.get('/:username', userController.getUserByUsername);// TESTED
userRouter.get('/checkEmail/:email', userController.emailAvailable);// TESTED
userRouter.use(authController.protect);

userRouter
    .route('/me/current')
    .get(userController.getCurrentUser)// TESTED
    .delete(userController.deleteMe); // TESTED
userRouter.get('/me/saved', userController.getSaved);// TESTED
userRouter.get('/me/hidden', userController.gethiddenPosts);// TESTED
userRouter.get('/me/upvoted', userController.getUpvoted);// TESTED
userRouter.get('/me/downvoted', userController.getDownvoted);// TESTED
userRouter
    .route('/me/settings')
    .get(userController.getMySettings)// TESTED
    .patch(userController.updateMySettings); // TESTED
userRouter.patch('/me/settings/changepassword', authController.updatePassword); // TESTED
// userRouter.patch("/me/updateEmail", userController.updateEmail);
userRouter
    .route('/me/friend/:username')
    .post(userController.checkBlocked, userController.addFriend)// TESTED
    .delete(userController.removeFriend);// TESTED
userRouter
    .route('/me/block/:username')
    .post(userController.unfollowBlockedUser, userController.blockUser)// TESTED
    .delete(userController.unblockUser);// TESTED
module.exports = userRouter;
