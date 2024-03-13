const express = require("express");
const userController = require("../controllers/usercontroller");
const authController = require("../controllers/authcontroller");
const userRouter = express.Router();


userRouter.post("/signup", authController.signup);
userRouter.post("/login", authController.login);
userRouter.get("/verify/:username/:token", authController.verifyEmail);
userRouter.get("/check/:username", userController.usernameAvailable);
userRouter.use(authController.protect);
//routes that need protection
userRouter
  .route("/me")
  .get(userController.getMe, userController.getUser)
  .delete(userController.deleteMe);
userRouter
  .route("/me/settings")
  .get(userController.getMySettings)
  .patch(userController.updateMySettings);
// userRouter.patch("/me/updatePassword", authController.updatePassword);
// userRouter.patch("/me/updateEmail", userController.updateEmail);  
userRouter
  .route("/me/friend/:username")
  .post(userController.addFriend)
  .delete(userController.removeFriend);
userRouter
  .route("/me/block/:username")
  .post(userController.blockUser)
  .delete(userController.unblockUser);

userRouter.get("/:username", userController.getUserByUsername);

module.exports = userRouter;
