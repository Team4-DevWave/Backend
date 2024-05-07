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
  message: {
    type: String,
    required: [true, 'please enter a message'],
  },
  chatID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'chatrooms',
  },
});

const populateFields = function(next) {
  this.populate({
    path: 'sender',
    select: 'username displayName profilePicture',
    model: 'users',
  });
  this.populate({
    path: 'chatID',
    model: 'chatrooms',
  });
  next();
};

chatMessageSchema.pre(/^find/, populateFields);
chatMessageSchema.pre('save', populateFields);

const chatMessageModel = mongoose.model(
    'chatmessages',
    chatMessageSchema,
);

module.exports = chatMessageModel;
