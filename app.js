const path = require('path');
const express = require('express');
const userRouter = require('./routes/userroutes.js');
const Apperror = require('./utils/apperror.js');
const globalErrorHandler = require('./controllers/errorcontroller.js');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());
app.use('/api/v1/users', userRouter);
// app.use("/api/v1/posts", postRouter);
// app.use("/api/v1/comments", commentRouter);
// app.use("/api/v1/r", subredditRouter);
// app.use("/api/v1/messages", messageRouter);

app.all('*', (req, res, next) => {
  next(new Apperror(`cant find ${req.originalUrl} on this server!`, 400));
});

app.use(globalErrorHandler);
module.exports = app;
