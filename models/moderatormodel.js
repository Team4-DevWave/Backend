const mongoose = require('mongoose');
const moderatorSchema =new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  subredditID: {type: mongoose.Schema.Types.ObjectId, ref: 'subreddits'},
  permissions: {
    manageUsers: {type: Boolean, required: true},
    manageSettings: {type: Boolean, required: true},
    manageModmail: {type: Boolean, required: true},
    managePostsComments: {type: Boolean, required: true},
    everything: {type: Boolean, required: true},
  },
});

const moderatorModel = mongoose.model('moderators', moderatorSchema);
module.exports = moderatorModel;
