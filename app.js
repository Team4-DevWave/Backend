const path = require("path");
const express = require("express");
const userRouter = require("./routes/userroutes.js");
const appError = require("./utils/appError.js");
const app = express();

app.use("/api/v1/users", userRouter);
app.use("/api/v1/posts", postRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/r", subredditRouter);
app.use("/api/v1/messages", messegeRouter);


app.all("*", (req, res, next) => {
  next(new appError(`cant find ${req.originalUrl} on this server!`, 400)); //<< if u pass error its going to know that its going to stop the whole program and go to the error middleware
});

module.exports = app;