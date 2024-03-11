const path = require("path");
const express = require("express");
const app = express();

app.use("/api/v1/users", userRouter);

app.all("*", (req, res, next) => {
  next(new appError(`cant find ${req.originalUrl} on this server!`, 400)); //<< if u pass error its going to know that its going to stop the whole program and go to the error middleware
});

module.exports = app;