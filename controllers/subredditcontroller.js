const subredditModel = require('../models/subredditmodel');
const handlerFactory = require('./handlerfactory');

exports.getAllSubreddits = handlerFactory.getAll(subredditModel);
exports.createSubreddit = handlerFactory.createOne(subredditModel);
exports.getSubreddit = handlerFactory.getOne(subredditModel);
