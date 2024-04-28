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
    default: null,
  },
});

chatroomSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'chatroomMembers',
    select: 'username displayName profilePicture',
    model: 'users',
  });
  next();
} );
chatroomSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'chatroomAdmin',
    select: 'username displayName profilePicture',
    model: 'users',
  });
  next();
} );

const chatroomModel = mongoose.model('chatrooms', chatroomSchema);

module.exports = chatroomModel;
