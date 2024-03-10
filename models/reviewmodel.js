import mongoose from "mongoose";
const reviewSchema = mongoose.Schema({
  reportID: { type: mongoose.Schema.Types.ObjectId, ref:'Report',required: true},
  moderatorID: { type: mongoose.Schema.Types.ObjectId, ref: 'Moderator' },
  adminID: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
})

const reviewModel = mongoose.model("Review", reviewSchema);
export default reviewModel;