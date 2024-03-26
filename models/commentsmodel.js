const mongoose = require('mongoose');
const commentController = require('../controllers/commentcontroller');
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
  votes: {type: Number, default: 0},
  post: {
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
  mentioned: {
    type: [mongoose.Schema.ObjectId],
    ref: 'users',
  },
});
commentSchema.post('save', async function() {
  // `this` is the saved or updated comment
  const comment = this;
  // Check if the document is new or was updated
  // if (comment.isNew || comment.isModified()) {
  commentController.createMessage(comment);
  // }
});

const commentModel = mongoose.model('comments', commentSchema);

module.exports = commentModel;
