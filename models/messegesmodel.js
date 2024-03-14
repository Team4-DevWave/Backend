const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.ObjectId,
    ref: "users",
    required: [true, "please enter a sender username"],
  },
  reciever: {
    type: mongoose.Schema.ObjectId,
    ref: "users",
    required: [true, "please enter a reciever username"],
  },
  subject: {
    type: String,
    required: [true, "please enter a message subject"],
  },
  content: {
    type: String,
    required: [true, "please enter a message content"],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  read: {
    type: Boolean,
    default: false,
  },
  parentMessege: {
    type: mongoose.Schema.ObjectId,
    ref: "messages",
  },
});

const messageModel = mongoose.model("messages", messageSchema);

module.exports = messageModel;
