const messageModel = require("../models/messagesmodel");
const AppError = require("../utils/apperror");
const catchAsync = require("../utils/catchasync");
const handlerFactory = require("./handlerfactory");

exports.getAllmessages = handlerFactory.getAll(messageModel);
exports.createmessage = handlerFactory.createOne(messageModel);
