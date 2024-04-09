const mongoose=require('mongoose');
const postSchema = new mongoose.Schema({
  commentsID: [{type: mongoose.Schema.Types.ObjectId, ref: 'comments'}],
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  postedTime: {type: Date, required: true},
  numViews: {type: Number, default: 0, required: true},
  subredditID: {type: mongoose.Schema.Types.ObjectId, ref: 'subreddits'},
  title: {type: String, required: true},
  type: {type: String, enum: ['poll', 'image/video', 'text'], required: true},
  spoiler: {type: Boolean, defaults: false, required: true},
  nsfw: {type: Boolean, defaults: false, required: true},
  lastEditedTime: {type: Date},
  votes: {
    upvotes: {type: Number, default: 0},
    downvotes: {type: Number, default: 0},
  },
  content: {type: String, required: true},
  locked: {type: Boolean, required: false, default: false},
  mentioned: [{type: mongoose.Schema.Types.ObjectId, ref: 'users'}],
  approved: {type: Boolean, required: true, default: false},
});

const postModel = mongoose.model('posts', postSchema);
module.exports = postModel;
