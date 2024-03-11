const mongoose = require("mongoose");

const messegeSchema = new mongoose.Schema({
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
    required: [true, "please enter a messege subject"],
  },
  content: {
    type: String,
    required: [true, "please enter a messege content"],
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
    ref: "messeges",
  },
});

const messegeModel = mongoose.model("messeges", messegeSchema);

module.exports = messegeModel;
