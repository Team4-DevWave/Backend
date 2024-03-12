const messegeModel = require("../models/messegesmodel");
const appError = require("../utils/apperror");
const catchAsync = require("../utils/catchasync");
const handlerFactory = require("./handlerfactory");

exports.getAllMesseges = handlerFactory.getAll(messegeModel);
exports.createMessege = handlerFactory.createOne(messegeModel);
