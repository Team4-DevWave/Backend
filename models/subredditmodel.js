const mongoose = require('mongoose');
const subredditSchema =new mongoose.Schema({
  name: {type: String, required: true, unique: true},
  moderators: [{type: mongoose.Schema.Types.ObjectId, ref: 'users'}],
  status: {type: String, default: 'Active', required: true},
  members: [{type: mongoose.Schema.Types.ObjectId, ref: 'users'}],
  description: {type: String},
  category: {type: String, enum: ['General', 'News', 'Discussion', 'Media', 'Hobbies', 'Meta',
    'Other', 'Sports', 'Gaming', 'Movies', 'Books', 'Music', 'Fitness', 'Health', 'Travelling',
    'Science', 'Technology', 'Programming', 'Art', 'DIY', 'Education', 'Vegan', 'Parenting']},
  srSettings: {
    srType: {
      type: String,
      enum: ['public', 'restricted', 'private'],
      required: true,
    },
    nsfw: {type: Boolean, required: true},
    country: {type: String},
    postType: {
      type: String,
      enum: ['links only', 'text posts only', 'any'],
      default: 'any',
    },
    allowCrossPosting: {type: Boolean, required: true, default: true},
    archivePosts: {type: Boolean, required: true, default: false},
    enableSpoilerTag: {type: Boolean, required: true, default: true},
    allowImages: {type: Boolean, required: true, default: true},
    allowMultipleImages: {type: Boolean, required: true, default: true},
    allowPolls: {type: Boolean, required: true, default: true},
    postReviewing: {type: Boolean, required: true, default: false},
    spamFilterStrength: {
      posts: {type: String, enum: ['low', 'high', 'all'], required: true, default: 'low'},
      comments: {type: String, enum: ['low', 'high', 'all'], required: true, default: 'low'},
      links: {type: String, enum: ['low', 'high', 'all'], required: true, default: 'low'},
    },
    suggestedSort: {
      type: String,
      enum: [
        'none',
        'best',
        'old',
        'top',
        'q&a',
        'live',
        'contraversial',
        'new',
      ],
    },
    collapseDeletedRemovedComments: {type: Boolean, required: true, default: true},
    welcomeMessageEnabled: {type: Boolean, required: true, default: false},
    welcomeMessage: {type: String},
  },
  srLooks: {
    banner: {type: String, default: ''},
    icon: {type: String, default: ''},
    color: {type: String, default: ''},
    darkMode: {type: Boolean, default: false},
  },
  rules: [{type: String}],
  userManagement: {
    banList: [{type: mongoose.Schema.Types.ObjectId, ref: 'users'}],
    mutedList: [{type: mongoose.Schema.Types.ObjectId, ref: 'users'}],
    approvedList: [{type: mongoose.Schema.Types.ObjectId, ref: 'users'}],
  },
  invitedUsers: [{type: mongoose.Schema.Types.ObjectId, ref: 'users'}],
});

subredditSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'members moderators invitedUsers',
    select: 'username',
  });
  next();
});
const subredditModel = mongoose.model('subreddits', subredditSchema);
module.exports = subredditModel;
