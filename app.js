const express = require('express');
const userRouter = require('./routes/userroutes.js');
const postRouter = require('./routes/postroutes.js');
const commentRouter = require('./routes/commentroutes.js');
const subredditRouter = require('./routes/subredditroutes.js');
const messageRouter = require('./routes/messageroutes.js');
const homepageRouter = require('./routes/homepageroutes.js');
const notificationRouter = require('./routes/notificationsroutes.js');
const metricsRouter = require('./routes/metrics.js');  // DevOps Metrics
const AppError = require('./utils/apperror.js');
const globalErrorHandler = require('./controllers/errorcontroller.js');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();
app.use(cors());


// app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());
app.use(bodyParser.json({limit: '50mb', extended: true}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true, parameterLimit: 5000000}));
app.use(bodyParser.text({limit: '200mb'}));
app.use('/api/v1/users', userRouter);
app.use('/api/v1/posts', postRouter);
app.use('/api/v1/comments', commentRouter);
app.use('/api/v1/r', subredditRouter);
app.use('/api/v1/messages', messageRouter);
app.use('/api/v1/homepage', homepageRouter);
app.use('/api/v1/notifications', notificationRouter);
app.use('/api/v1/metrics', metricsRouter);  // DevOps Metrics

app.all('*', (req, res, next) => {
  next(new AppError(`cant find ${req.originalUrl} on this server!`, 400));
  // << if u pass error its going to know that its going to stop the whole program and go to the error middleware
});

app.use(globalErrorHandler);
module.exports = app;
