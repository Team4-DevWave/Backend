const catchAsync = require('./../utils/catchasync');
const APIFeatures = require('./../utils/apifeatures');
const AppError = require('./../utils/apperror');

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

exports.updateOne = (model) =>
  catchAsync(async (req, res, next) => {
    const doc = await model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      return next(new AppError('no document with that id', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.createOne = (model) =>
  catchAsync(async (req, res, next) => {
    const doc = await model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        data: doc,
      },
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
      data: {
        data: doc,
      },
    });
  });

exports.getAll = (model) =>
  catchAsync(async (req, res, next) => {
    // let filter = {};
    // if (req.params.tourId) filter = { tour: req.params.tourId }; //if  there is a param in the url then we apply that filter to get reviews for that specific tour only , else if filter is empty just get all reviews
    // execute query
    const features = new APIFeatures(model.find(), req.query); // .find returns query, .aggregate returns object
    features.filter().sort().limitFields().paginate();
    const doc = await features.query;
    // query.sort().select().skip().limit()
    // send response
    res.status(200).json({
      status: 'success',
      result: doc.length,
      data: {
        doc,
      },
    });
  });
