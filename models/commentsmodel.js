const mongoose = require('mongoose');
const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'users',
    required: [true, 'please enter a username'],
  },
  content: {
    type: String,
    required: [true, 'please enter a comment'],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  lastEdited: {
    type: Date,
  },
  votes: {
    upvotes: {type: Number, default: 0},
    downvotes: {type: Number, default: 0},
  },
  post: {
    type: mongoose.Schema.ObjectId,
    ref: 'posts',
    required: [true, 'comment must belong to a post'],
  },
  collapsed: {
    type: Boolean,
    default: false,
  },
  mentioned: {
    type: [mongoose.Schema.ObjectId],
    ref: 'users',
  },
});
commentSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'username',
  });
  next();
});

commentSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'mentioned',
    select: 'username',
  });
  next();
});
const commentModel = mongoose.model('comments', commentSchema);

module.exports = commentModel;
