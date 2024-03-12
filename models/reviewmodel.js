import mongoose from "mongoose";
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
export default reviewModel;
