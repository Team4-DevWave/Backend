const subredditModel = require('../models/subredditmodel');
const catchasync = require('../utils/catchasync');


exports.getCommunities = catchasync(async (req, res, next) => {
  const communities = await subredditModel.find({});
  const userCommunities = req.user.joinedSubreddits;
  res.status(200).json({
    status: 'success',
    communities,
    userCommunities,
  });
});
