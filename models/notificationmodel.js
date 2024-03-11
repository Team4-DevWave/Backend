const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  read: { type: Boolean, default: false },
  type: { type: String, required: true },
  link: { type: String },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const Notification = mongoose.model("notifications", notificationSchema);

module.exports = Notification;
