const express = require('express');
const userController = require('../controllers/usercontroller');
const authController = require('../controllers/authcontroller');
// eslint-disable-next-line new-cap
const userRouter = express.Router();
userRouter.post('/signup', authController.signup);// TESTED
userRouter.post('/login', authController.login);// TESTED
userRouter.get('/verify/:username/:token', authController.verifyEmail);
userRouter.get('/check/:username', userController.usernameAvailable);// TESTED
userRouter.post('/forgotPassword', authController.forgotPassword);
userRouter.patch('/resetPassword/:token', authController.resetPassword);
userRouter.get('/:username/posts/:pageNumber', userController.getPosts);// TESTED
userRouter.get('/:username/comments/:pageNumber', userController.getComments);// TESTED
userRouter.get('/:username/overview/:pageNumber', userController.getOverview);// TESTED
userRouter.get('/:username/about', userController.getAbout); // might not need // TESTED
userRouter.get('/:username', userController.getUserByUsername);// TESTED
userRouter.use(authController.protect);
userRouter.get('/me/saved/:pageNumber', userController.getSaved);// TESTED
userRouter.get('/me/hidden/:pageNumber', userController.gethiddenPosts);// TESTED
userRouter.get('/me/upvoted/:pageNumber', userController.getUpvoted);// TESTED
userRouter.get('/me/downvoted/:pageNumber', userController.getDownvoted);// TESTED
userRouter.post('/changepassword', authController.updatePassword);
userRouter
    .route('/me/current')
    .get(userController.getCurrentUser)// TESTED
    .delete(userController.deleteMe);
userRouter
    .route('/me/settings')
    .get(userController.getMySettings)// TESTED
    .patch(userController.updateMySettings);
// userRouter.patch("/me/updatePassword", authController.updatePassword);
// userRouter.patch("/me/updateEmail", userController.updateEmail);
userRouter
    .route('/me/friend/:username')
    .post(userController.checkBlocked, userController.addFriend)// TESTED
    .delete(userController.removeFriend);// TESTED
userRouter
    .route('/me/block/:username')
    .post(userController.unfollowBlockedUser, userController.blockUser)// TESTED
    .delete(userController.unblockUser);// TESTED
// admin only routes INCOMPLETE
// userRouter
//     .route('/admin/delete/:username')
//     .delete(userController.deleteUser);
module.exports = userRouter;
