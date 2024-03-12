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


module.exports = userRouter;
