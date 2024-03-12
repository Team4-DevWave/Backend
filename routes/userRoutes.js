const express = require("express");
const userController = require("./../controllers/usercontroller");
const authController = require("./../controllers/authcontroller");
const userRouter = express.Router();

userRouter.get(
  "/username_available/:username",
  userController.usernameAvailable
);

//routes that need protection
userRouter
  .route("/me")
  .get(userController.getMe, userController.getUser)
  .patch(userController.updateMe)
  .delete(userController.deleteMe);
userRouter
  .route("/me/settings")
  .get(userController.getMySettings)
  .patch(userController.updateMySettings);
userRouter
  .route("/me/friend/:username")
  .post(userController.addFriend)
  .delete(userController.removeFriend);
userRouter
  .route("/me/block/:username")
  .post(userController.blockUser)
  .delete(userController.unblockUser);





module.exports = userRouter;
