const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'please enter a username'],
    unique: true,
  },
  email: {
    type: String,
    required: [true, 'please enter an email'],
    unique: true,
    trim: true,
    lowercase: true,
    validate: [validator.isEmail, 'please enter a valid email'],
  },
  password: {
    type: String,
    required: [true, 'please enter a password'],
    minlength: 8,
    select: false, // password should not be shown in the database
  },
  verified: {
    type: Boolean,
    default: false,
  },
  displayName: {
    type: String,
    default: '',
  },
  profilePicture: {
    type: String,
    default: '',
  },
  verificationToken: {
    type: String,
    default: '',
  },
  passwordConfirm: {
    type: String,
    // required: [true, "please confirm your password"],
    validate: {
      validator: function(el) {
        return el === this.password; // el is passwordconfirm , password is the current user password
        // if returns false then a validation error is going to appear
      }, // callback function
      message: 'Passwords are not the same',
    }, // custom validator WORKS ONLY ON CREATE AND SAVE! NOT ON EACH UPDATE
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date, // security measure for reset token
  dateJoined: {
    // cake day
    type: Date,
    default: Date.now(),
  },
  country: {
    type: String,
    required: [true, 'please enter a country'],
  },
  gender: {
    type: String,
    enum: ['I prefer not to say', 'man', 'woman', 'non-binary', 'other'],
    default: 'I prefer not to say',
  },
  interests: {
    type: [String],
    default: [],
    required: [true, 'please enter your interests'],
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  followedUsers: {
    type: [mongoose.Schema.ObjectId],
    ref: 'users',
  },
  blockedUsers: {
    type: [mongoose.Schema.ObjectId],
    ref: 'users',
  },
  joinedSubreddits: {
    type: [mongoose.Schema.ObjectId],
    ref: 'subreddits',
  },
  followedPosts: {
    type: [mongoose.Schema.ObjectId],
    ref: 'posts',
  },
  settings: {
    type: mongoose.Schema.ObjectId,
    ref: 'settings',
  },
  savedPostsAndComments: {
    comments: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'comments',
      },
    ],
    posts: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'posts',
      },
    ],
  },
  viewedPosts: {
    type: [mongoose.Schema.ObjectId],
    ref: 'posts',
  },
  hiddenPosts: {
    type: [mongoose.Schema.ObjectId],
    ref: 'posts',
  },
  posts: {
    type: [mongoose.Schema.ObjectId],
    ref: 'posts',
  },
  upvotes: {
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'comments',
      },
    ],
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'posts',
      },
    ],
  },
  downvotes: {
    comments: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'comments',
      },
    ],
    posts: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'posts',
      },
    ],
  },
  karma: {
    comments: {
      type: Number,
      default: 0,
    },
    posts: {
      type: Number,
      default: 0,
    },
  },

  disabledSubredditNotifications: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'subreddits',
    },
  ],
  notificationCount: {type: Number, default: 0},
  deviceToken: {type: String, default: 'NONE'},
  favourites: [
    {
      name: {type: String},
      type: {type: String},
    },
  ],
});
// password encryption
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// hides deleted users in postman but not in database
userSchema.pre(/^find/, function(next) {
  this.find({active: {$ne: false}});
  next();
});

// password reset token
userSchema.methods.createPasswordResetToken = function() {
  // 1)create token
  const resetToken = crypto.randomBytes(32).toString('hex');
  // 2)encrypt token
  this.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // convert 10min to milliseconds
  return resetToken; // returns token that should be sent to email
};

// compares the password entered by the user with the hashed password in the database
userSchema.methods.correctPassword = async function(
    candidatePassword,
    userPassword,
) {
  // this.password wont work here anymore as we made password select:false (not visible)
  // candidate pass is not hashed (original pass from user), userpassword is hashed
  return await bcrypt.compare(candidatePassword, userPassword);
};

// checks if the password was changed after the token was issued
userSchema.methods.changedPasswordsAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
        this.passwordChangedAt.getTime() / 1000,
        10,
    );
    return JWTTimestamp < changedTimestamp; // check if password was changed after token was issued
  }
  return false;
};

const userModel = mongoose.model('users', userSchema);

module.exports = userModel;
