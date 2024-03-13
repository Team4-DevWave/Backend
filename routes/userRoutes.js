const express = require("express");
const userController = require("../controllers/usercontroller");
const authController = require("../controllers/authcontroller");
const userRouter = express.Router();


userRouter.post("/signup", authController.signup);
userRouter.post("/login", authController.login);
userRouter.get("/verify/:username/:token", authController.verifyEmail);
userRouter.use(authController.protect);
//routes that need protection

module.exports = userRouter;
