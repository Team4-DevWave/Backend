import mongoose from "mongoose";
const moderatorSchema = mongoose.Schema({
  userID: { type: mongoose.Schema.Types.ObjectId, ref:'User',required: true},
  subredditID: { type: mongoose.Schema.Types.ObjectId, ref: 'Subreddit' },
})

const moderatorModel = mongoose.model("Moderator", moderatorSchema);
export default moderatorModel;