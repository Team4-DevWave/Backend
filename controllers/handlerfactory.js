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
    let modifiedBody = modifyReqBody(req);
    if (modifiedBody instanceof Promise) {
      modifiedBody = await modifiedBody;
    }
    const doc = await model.findByIdAndUpdate(req.params.id, {$set: modifiedBody}, {
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
    let modifiedBody = modifyReqBody(req);
    if (modifiedBody instanceof Promise) {
      modifiedBody = await modifiedBody;
    }
    const doc = await model.create(modifiedBody);
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

exports.voteOne=(model, voteOn)=> catchAsync(async (req, res, next) => {
  const voteType= req.body.voteType;
  if (voteType!==1 && voteType!==-1) {
    return next(new AppError('invalid vote type', 400));
  }
  const doc= await model.findById(req.params.id);
  if (!doc) {
    return next(new AppError('no document with that id', 404));
  }
  let uservote;
  if (req.user.upvotes[voteOn].includes(req.params.id)) {
    uservote=1;
  } else if (req.user.downvotes[voteOn].includes(req.params.id)) {
    uservote=-1;
  } else {
    uservote=0;
  }
  if (voteType==uservote) {
    doc.votes-=voteType;
    if (voteType==1) {
      req.user.upvotes[voteOn].pull(req.params.id);
    } else if (voteType==-1) {
      req.user.downvotes[voteOn].pull(req.params.id);
    }
  } else if (voteType==-uservote) {
    doc.votes+=2*voteType;
    if (voteType==1) {
      req.user.upvotes[voteOn].push(req.params.id);
      req.user.downvotes[voteOn].pull(req.params.id);
    } else if (voteType==-1) {
      req.user.downvotes[voteOn].push(req.params.id);
      req.user.upvotes[voteOn].pull(req.params.id);
    }
  } else {
    doc.votes+=voteType;
    if (voteType==1) {
      req.user.upvotes[voteOn].push(req.params.id);
    } else if (voteType==-1) {
      req.user.downvotes[voteOn].push(req.params.id);
    }
  }
  await doc.save();
  await req.user.save();
  res.status(200).json({
    status: 'success',
  });
});

exports.checkMentions=async (model, content)=> {
  const mentionRegex = /(?:r\/|u\/)(\w+)/g;
  let match;
  const mentionedUsers = [];
  while ((match = mentionRegex.exec(content)) !== null) {
    const mentionedUser = await model.findOne({username: match[1]});
    if (mentionedUser) {
      mentionedUsers.push(mentionedUser.id);
    }
  }
  return mentionedUsers;
};
