const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  from: {
    type: mongoose.Schema.ObjectId,
    ref: 'users',
    required: [true, 'please enter a sender username'],
  },
  to: {
    type: mongoose.Schema.ObjectId,
    ref: 'users',
    required: [true, 'please enter a reciever username'],
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

const messageModel = mongoose.model('messages', messageSchema);

module.exports = messageModel;
