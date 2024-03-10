import mongoose from "mongoose";
const moderatorSchema = mongoose.Schema({
  userID: { type: mongoose.Schema.Types.ObjectId, ref:'User',required: true},
  subredditID: { type: mongoose.Schema.Types.ObjectId, ref: 'Subreddit' },
  permissions: { 
    manageUsers: { type: Boolean, required: true },
    manageSettings: { type: Boolean, required: true },
    manageModmail: { type: Boolean, required: true },
    managePostsComments: { type: Boolean, required: true },
    everything: { type: Boolean, required: true },
  },
})

const moderatorModel = mongoose.model("Moderator", moderatorSchema);
export default moderatorModel;