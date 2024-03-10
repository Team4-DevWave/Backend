import mongoose from "mongoose";
const postSchema = mongoose.Schema({
  commentsID: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  userID: { type: mongoose.Schema.Types.ObjectId, ref:'User',required: true},
  postedTime: { type: Date, required: true },
  numViews: { type: Number, required: true },
  subredditID: { type: mongoose.Schema.Types.ObjectId, ref: 'Subreddit' },
  title: { type: String, required: true },
  type: { type: String, enum:["poll","image/video","text"],required: true },
  spoiler: { type: Boolean, required: true },
  nsfw: { type: Boolean, required: true },
  lastEditedTime: { type: Date, required: true },
  votes: { type: Number, required: true },
  content: { type: String, required: true },
})

const postModel = mongoose.model("Review", postSchema);
export default postModel;