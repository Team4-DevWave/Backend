import mongoose from 'mongoose';
const postSchema = mongoose.Schema({
  commentsID: [{type: mongoose.Schema.Types.ObjectId, ref: 'comments'}],
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  postedTime: {type: Date, required: true},
  numViews: {type: Number, required: true},
  subredditID: {type: mongoose.Schema.Types.ObjectId, ref: 'subreddits'},
  title: {type: String, required: true},
  type: {type: String, enum: ['poll', 'image/video', 'text'], required: true},
  spoiler: {type: Boolean, required: true},
  nsfw: {type: Boolean, required: true},
  lastEditedTime: {type: Date, required: true},
  votes: {type: Number, required: true},
  content: {type: String, required: true},
  locked: {type: Boolean, required: false},
});

const postModel = mongoose.model('reviews', postSchema);
export default postModel;
