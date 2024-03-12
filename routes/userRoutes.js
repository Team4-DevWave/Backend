const express = require("express");
const userController = require("./../controllers/usercontroller");
const authController = require("./../controllers/authcontroller");
const userRouter = express.Router();

userRouter.get(
  "/username_available/:username",
  userController.usernameAvailable
);

module.exports = userRouter;
