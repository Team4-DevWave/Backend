const mongoose = require('mongoose');
const postSchema = mongoose.Schema({
  commentsID: [{type: mongoose.Schema.Types.ObjectId, ref: 'comments'}],
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  postedTime: {type: Date, required: true},
  numViews: {type: Number, required: true},
  subredditID: {type: mongoose.Schema.Types.ObjectId, ref: 'subreddits'},
  title: {type: String, required: true},
  type: {type: String, enum: ['poll', 'image/video', 'text'], required: true},
  spoiler: {type: Boolean, required: true},
  nsfw: {type: Boolean, required: true},
  lastEditedTime: {type: Date, required: true},
  votes: {type: Number, required: true},
  content: {type: String, required: true},
  locked: {type: Boolean, required: false, default: false},
  hidden: {type: Boolean, required: false, default: false},
});

const postModel = mongoose.model('posts', postSchema);
module.exports = postModel;
