const mongoose = require('mongoose');

const chatroomSchema = new mongoose.Schema({
  dateCreated: {
    type: Date,
    default: Date.now(),
  },
  chatroomName: {
    type: String,
    required: true,
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
          required: true,
        },
  isGroup: {
    type: Boolean,
    default: false,
  },
  latestMessage: {
    type: mongoose.Schema.ObjectId,
    ref: 'chatmessages',
  },
});
const populateFields = function(next) {
  this.populate({
    path: 'chatroomMembers',
    select: 'username displayName profilePicture',
    model: 'users'});
  this.populate({
    path: 'chatroomAdmin',
    select: 'username displayName profilePicture',
    model: 'users'});
};
chatroomSchema.pre(/^find/, populateFields );
chatroomSchema.pre('save', populateFields );

const chatroomModel = mongoose.model('chatrooms', chatroomSchema);

module.exports = chatroomModel;
