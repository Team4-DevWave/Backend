const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  from: {
    type: mongoose.Schema.ObjectId,
    ref: 'users',
    required: [true, 'please enter a sender username'],
  },
  fromType: {
    type: String,
    enum: ['users', 'subreddits'],
    default: 'users',
    required: true,
  },
  to: {
    type: mongoose.Schema.ObjectId,
    ref: 'users',
    required: [true, 'please enter a reciever username'],
  },
  toType: {
    type: String,
    enum: ['users', 'subreddits'],
    default: 'users',
    required: true,
  },
  subject: {
    type: String,
    required: [true, 'please enter a message subject'],
  },
  message: {
    type: String,
    required: [true, 'please enter a message content'],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  read: {
    type: Boolean,
    default: false,
  },
  collapsed: {
    type: Boolean,
    default: false,
  },
  parentmessage: {
    type: mongoose.Schema.ObjectId,
    ref: 'messages',
  },
  comment: {
    type: mongoose.Schema.ObjectId,
    ref: 'comments',
  },
  post: {
    type: mongoose.Schema.ObjectId,
    ref: 'posts',
  },
});
messageSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'from',
    select: 'username' || 'name',
    model: this.fromType,
  }).populate({
    path: 'to',
    select: 'username' || 'name',
    model: this.toType,
  });
  next();
});
const messageModel = mongoose.model('messages', messageSchema);

module.exports = messageModel;
