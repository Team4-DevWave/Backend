const express = require("express");
const postController = require("./../controllers/postcontroller");
const authController = require("./../controllers/authcontroller");
const commentRouter = require("./commentroutes");
const postRouter = express.Router();
postRouter.use("/:postid/comments", commentRouter);

postRouter.use(authController.protect);

postRouter
  .route("/")
  .post(postController.createPost)
  .get(postController.getPosts);
postRouter.get("/:postid", postController.getPost);
postRouter.delete("/:postid/delete", postController.deletePost);
postRouter.post("/:postid/vote", postController.vote);
postRouter.patch("/:postid/edit", postController.editPost);
postRouter.patch("/:postid/save", postController.savePost);
postRouter.patch("/:postid/hide", postController.hidePost);
postRouter.patch("/:postid/report", postController.reportPost);
postRouter.post("/:postId/crosspost", postController.crosspost);

module.exports = postRouter;
