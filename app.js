const path = require("path");
const express = require("express");
const userRouter = require("./routes/userroutes.js");
const postRouter = require("./routes/postroutes.js");
const commentRouter = require("./routes/commentroutes.js");
const subredditRouter = require("./routes/subredditroutes.js");
const messegeRouter = require("./routes/messegeroutes.js");
const appError = require("./utils/apperror.js");
const globalErrorHandler = require("./controllers/errorcontroller.js");
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());
app.use("/api/v1/users", userRouter);
app.use("/api/v1/posts", postRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/r", subredditRouter);
app.use("/api/v1/messages", messegeRouter);

app.all("*", (req, res, next) => {
  next(new appError(`cant find ${req.originalUrl} on this server!`, 400)); //<< if u pass error its going to know that its going to stop the whole program and go to the error middleware
});

app.use(globalErrorHandler);
module.exports = app;
