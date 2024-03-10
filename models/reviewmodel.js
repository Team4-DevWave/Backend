import mongoose from "mongoose";
const reviewSchema = mongoose.Schema({
  reportID: { type: mongoose.Schema.Types.ObjectId, ref:'Report',required: true},
  moderatorID: { type: mongoose.Schema.Types.ObjectId, ref: 'Moderator' },
})

const reviewModel = mongoose.model("Review", reviewSchema);
export default reviewModel;