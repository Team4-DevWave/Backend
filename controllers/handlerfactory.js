const catchAsync = require('../utils/catchasync');
const APIFeatures = require('../utils/apifeatures');
const AppError = require('../utils/apperror');

exports.deleteOne = (model) =>
  catchAsync(async (req, res, next) => {
    const doc = await model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError('no document with that id', 404));
    }
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

exports.updateOne = (model, modifyReqBody = (req) => req.body) =>
  catchAsync(async (req, res, next) => {
    const doc = await model.findByIdAndUpdate(req.params.id, {$set: modifyReqBody(req)}, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      return next(new AppError('no document with that id', 404));
    }
    res.status(200).json({
      status: 'success',
      data: doc,
    });
  });

exports.createOne = (model, modifyReqBody = (req) => req.body) =>
  catchAsync(async (req, res, next) => {
    const doc = await model.create(modifyReqBody(req));
    res.status(201).json({
      status: 'success',
      data: doc,
    });
  });

exports.getOne = (model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    let query = model.findById(req.params.id);
    if (populateOptions) {
      query = query.populate(populateOptions);
    }
    const doc = await query;
    if (!doc) {
      return next(new AppError('no document with that id', 404));
    }
    res.status(200).json({
      status: 'success',
      result: doc.length,
      data: doc,
    });
  });

exports.getAll = (model, filterFunc = () => ({})) =>
  catchAsync(async (req, res, next) => {
    const filter = filterFunc(req);
    const doc = await model.find(filter);
    res.status(200).json({
      status: 'success',
      result: doc.length,
      data:
        doc,
    });
  });


