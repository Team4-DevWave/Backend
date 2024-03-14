const mongoose = require('mongoose');

const chatroomSchema = new mongoose.Schema({
  dateCreated: {
    type: Date,
    default: Date.now(),
  },
  chatroomName: {
    type: String,
  },
  chatroomMembers: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'users',
    },
  ],
  chatroomMessages: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'chatmessages',
    },
  ],
  chatroomAdmin:
        {
          type: mongoose.Schema.ObjectId,
          ref: 'users',
        },

});

const chatroomModel = mongoose.model('chatrooms', chatroomSchema);

module.exports = chatroomModel;
