const mongoose = require("mongoose");
const reviewSchema = mongoose.Schema({
  reportID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "reports",
    required: true,
  },
  moderatorID: { type: mongoose.Schema.Types.ObjectId, ref: "moderators" },
  adminID: { type: mongoose.Schema.Types.ObjectId, ref: "admins" },
});

const reviewModel = mongoose.model("reviews", reviewSchema);
module.exports = reviewModel;
