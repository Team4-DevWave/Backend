const express = require('express');
const userController = require('../controllers/usercontroller');
const authController = require('../controllers/authcontroller');
// eslint-disable-next-line new-cap
const userRouter = express.Router();
userRouter.post('/signup', authController.signup);
userRouter.post('/login', authController.login);
userRouter.post('/forgotUsername', authController.forgotUsername);
userRouter.get('/googleLogin', authController.googleLogin);
userRouter.post('/googleSignup', authController.googleSignup);
userRouter.get('/verify/:username/:token', authController.verifyEmail);
userRouter.get('/check/:username', userController.usernameAvailable);
userRouter.post('/forgotPassword', authController.forgotPassword);
userRouter
    .route('/resetPassword/:token')
    .get(authController.validateResetToken)
    .post(authController.resetPassword);
userRouter.get('/:username/posts', userController.getPosts);
userRouter.get('/:username/comments', userController.getComments);
userRouter.get('/:username/overview', userController.getOverview);
userRouter.get('/:username/about', userController.getAbout); // might not need
userRouter.get('/:username', userController.getUserByUsername);
userRouter.get('/checkEmail/:email', userController.emailAvailable);

userRouter.use(authController.protect);
userRouter.get('/me/signout', authController.signout);
userRouter.delete('/:username/delete', userController.deleteUser);
userRouter
    .route('/me/current')
    .get(userController.getCurrentUser)
    .delete(userController.deleteMe);
userRouter.get('/me/saved', userController.getSaved);
userRouter.get('/me/hidden', userController.gethiddenPosts);
userRouter.get('/me/upvoted', userController.getUpvoted);
userRouter.get('/me/downvoted', userController.getDownvoted);
userRouter.get('/me/history', userController.getViewedPosts);
userRouter
    .route('/me/settings')
    .get(userController.getMySettings)
    .patch(userController.updateMySettings);
userRouter.patch('/me/settings/changepassword', authController.updatePassword);
userRouter.patch('/me/settings/changeemail', authController.changeEmail);
userRouter.patch('/me/settings/changecountry', userController.changeCountry);
userRouter.post('/me/settings/addsociallink', userController.addSocialLink);
userRouter.delete('/me/settings/removesociallink/:sociallinkid', userController.removeSocialLink);
userRouter.patch('/me/changeGender', userController.changeGender);
userRouter.patch('/me/changeDisplayName', userController.changeDisplayName);
userRouter.patch('/me/changeProfilePic', userController.changeProfilePic);
userRouter
    .route('/me/friend/:username')
    .post(userController.checkBlocked, userController.addFriend)
    .delete(userController.removeFriend);
userRouter
    .route('/me/block/:username')
    .post(userController.unfollowBlockedUser, userController.blockUser)
    .delete(userController.unblockUser);
userRouter
    .route('/me/favorites')
    .get(userController.getFavorites)
    .patch(userController.addFavourites)
    .delete(userController.deleteFavourites);
module.exports = userRouter;
