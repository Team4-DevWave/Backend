const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  dateSent: {
    type: Date,
    default: Date.now(),
  },
  sender: {
    type: mongoose.Schema.ObjectId,
    ref: 'users',
    required: [true, 'please enter a sender username'],
  },
  reciever: [{
    type: mongoose.Schema.ObjectId,
    ref: 'users',
    required: [true, 'please enter a reciever username'],
  }],
  message: {
    type: String,
    required: [true, 'please enter a message'],
  },
});

const chatMessageModel = mongoose.model(
    'chatmessages',
    chatMessageSchema,
);

module.exports = chatMessageModel;
