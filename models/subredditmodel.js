import mongoose from "mongoose";
const subredditSchema = mongoose.Schema({
  name: { type: String, required: true, unique: true },
  moderatorsID: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, required: true },
  membersID: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  postsID: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
  description: { type: String, required: true },
})

const subredditModel = mongoose.model("Subreddit", subredditSchema);
export default subredditModel;