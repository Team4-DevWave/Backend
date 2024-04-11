const mongoose=require('mongoose');
const postSchema = new mongoose.Schema({
  commentsCount: {type: Number, default: 0},
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  postedTime: {type: Date, required: true},
  numViews: {type: Number, default: 0, required: true},
  subredditID: {type: mongoose.Schema.Types.ObjectId, ref: 'subreddits'},
  title: {type: String, required: true},
  type: {type: String, enum: ['poll', 'image/video', 'text', 'url'], required: true},
  spoiler: {type: Boolean, required: true},
  nsfw: {type: Boolean, required: true},
  lastEditedTime: {type: Date},
  text_body: {type: String},
  image: {type: String},
  video: {type: String},
  url: {type: String},
  poll: {type: Map, of: Number},
  locked: {type: Boolean, default: false},
  votes: {
    upvotes: {type: Number, default: 0},
    downvotes: {type: Number, default: 0},
  },
  parentPost: {type: mongoose.Schema.Types.ObjectId, ref: 'posts'},
  mentioned: [{type: mongoose.Schema.Types.ObjectId, ref: 'users'}],
  approved: {type: Boolean, required: true, default: false},
},
{
  // second option is schema options (used to show virtual properties)
  toJSON: {virtuals: true},
  toObject: {virtuals: true}, // display virtual as object
});

// postSchema.virtual('comments', {
//   ref: 'comments', // schema u want to reference/ connect to
//   foreignField: 'post',
//   // we have field called post in comment model which has the id of the post it belongs to
//   // so we specify that in the foreignfield to connect both models
//   localField: '_id', // then u need to specify where that tour id is specified in the current model (postmodel)
// });

// //query middle ware
postSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'userID',
    select: 'username',
  });
  next();
});
postSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'parentPost',
  });
  next();
});
postSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'subredditID',
    select: 'name',
  });
  next();
});
const postModel = mongoose.model('posts', postSchema);
module.exports = postModel;
