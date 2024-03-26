const subredditModel = require('../models/subredditmodel');
const catchasync = require('../utils/catchasync');


exports.getCommunities = catchasync(async (req, res, next) => {
  const allcommunities = await subredditModel.find({});
  const myuserCommunities = req.user.joinedSubreddits;
  res.status(200).json({
    status: 'success',
    data: {
      communities: {allcommunities},
      userCommunities: {myuserCommunities},
    },
  });
});

