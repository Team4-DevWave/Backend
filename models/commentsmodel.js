const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  author: {
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
  votes: {type: Number, default: 0},
  postID: {
    type: mongoose.Schema.ObjectId,
    ref: 'posts',
    required: [true, 'comment must belong to a post'],
  },
  hidden: {
    type: Boolean,
    default: false,
  },
  saved: {
    type: Boolean,
    default: false,
  },
  collapsed: {
    type: Boolean,
    default: false,
  },
  parentComment: {
    type: mongoose.Schema.ObjectId,
    ref: 'comments',
  },
  mentioned: { // unsure
    type: [mongoose.Schema.ObjectId],
    ref: 'users',
  },
});

const commentModel = mongoose.model('comments', commentSchema);

module.exports = commentModel;
