import mongoose from "mongoose";
const subredditSchema = mongoose.Schema({
  name: { type: String, required: true, unique: true },
  moderatorsID: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, required: true },
  membersID: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  postsID: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
  description: { type: String, required: true },
  category: { type: String, required: true },
  srSettings:{
    srType : { type: String, enum:["public","restricted","private"],required: true },
    nsfw: { type: Boolean, required: true },
    country: { type: String, required: true },
    postType: { type: String, enum:["links only","text posts only","any"],required: true },
    allowCrossPosting: { type: Boolean, required: true },
    archivePosts: { type: Boolean, required: true },
    enableSpoilerTag: { type: Boolean, required: true },
    allowImages: { type: Boolean, required: true },
    allowMultipleImages: { type: Boolean, required: true },
    allowPolls: { type: Boolean, required: true },
    spamFilterStrength:{
      posts: { type: String, enum:["low","high","all"],required: true },
      comments: { type: String, enum:["low","high","all"],required: true },
      links: { type: String, enum:["low","high","all"],required: true },
    },
    suggestedSort: { type: String, enum:["none","best","old","top","q&a","live","contraversial","new"],required: true },
    collapseDeletedRemovedComments: { type: Boolean, required: true },
    welcomeMessageEnabled: { type: Boolean, required: true },
    welcomeMessage: { type: String, required: true },
  },
  srLooks:{
    banner: { type: String, required: true },
    icon: { type: String, required: true },
    color: { type: String, required: true },
    darkMode: { type: Boolean, required: true },
  },
  rules: [{ type: String, required: true }],
  userManagement:{
    banList: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    mutedList: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    approvedList: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
})

const subredditModel = mongoose.model("Subreddit", subredditSchema);
export default subredditModel;