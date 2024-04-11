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
  type: {type: String, enum: ['poll', 'image/video', 'text', 'url'], required: true},
  spoiler: {type: Boolean, required: true},
  nsfw: {type: Boolean, required: true},
  lastEditedTime: {type: Date},
  text_body: {type: String},
  image: {type: String},
  video: {type: String},
  url: {type: String},
  poll: {type: Map, of: Number},
  locked: {type: Boolean, default: false},
  votes: {
    upvotes: {type: Number, default: 0},
    downvotes: {type: Number, default: 0},
  },
  mentioned: [{type: mongoose.Schema.Types.ObjectId, ref: 'users'}],
  approved: {type: Boolean, required: true, default: false},
});

const postModel = mongoose.model('posts', postSchema);
module.exports = postModel;
