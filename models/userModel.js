const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

//name,email,photo,password,password confirm, password changed at, password reset token, password reset expires, date joined, country, upvotes,downvotes, karma,saved posts and comments, viewed posts, hidden posts, comments, posts, followed users, blocked users, joined subreddits, user profile, safety and privacy, feed settings, notifications, email settings, chat and messaging settings, active
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "please enter a username"],
  },
  email: {
    type: String,
    required: [true, "please enter an email"],
    unique: true,
    trim: true,
    lowercase: true,
    validate: [validator.isEmail, "please enter a valid email"], // custom validator to check if its format is an email (npm package)
  },
  password: {
    type: String,
    required: [true, "please enter a password"],
    minlength: 8,
    select: false, // password should not be shown in the database
  },
  passwordConfirm: {
    type: String,
    required: [true, "please confirm your password"],
    validate: {
      validator: function (el) {
        return el === this.password; // el is passwordconfirm , password is the current user password
        //if returns false then a validation error is going to appear
      }, //callback function
      message: "Passwords are not the same",
    }, //custom validator WORKS ONLY ON CREATE AND SAVE! NOT ON EACH UPDATE
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date, //security measure for reset token
  dateJoined: {
    type: Date,
    default: Date.now(),
  },
  country: {
    type: String,
    required: [true, "please enter a country"],
  },
  gender: {
    type: String,
    enum: ["I prefer not to say", "man", "woman", "non-binary", "other"],
    default: "I prefer not to say",
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  followedUsers: {
    type: [mongoose.Schema.ObjectId],
  },
  blockedUsers: {
    type: [mongoose.Schema.ObjectId],
  },
  joinedSubreddits: {
    type: [mongoose.Schema.ObjectId],
  },
  userProfile: {
    type: mongoose.Schema.ObjectId,
    ref: "userProfile",
    required: [true, "user must have a user profile"],
  },
  safetyAndPrivacy: {
    type: mongoose.Schema.ObjectId,
    ref: "safetyAndPrivacy",
    required: [true, "user must have a safety and privacy settings"],
  },
  feedSettings: {
    type: mongoose.Schema.ObjectId,
    ref: "feedSettings",
    required: [true, "user must have a feed settings"],
  },
  notifications: {
    type: mongoose.Schema.ObjectId,
    ref: "notifications",
    required: [true, "user must have a notifications settings"],
  },
  emailSettings: {
    type: mongoose.Schema.ObjectId,
    ref: "emailSettings",
    required: [true, "user must have a email settings"],
  },
  chatAndMessagingSettings: {
    type: mongoose.Schema.ObjectId,
    ref: "chatSettings",
    required: [true, "user must have a chat settings"],
  },
  savedPostsAndComments: {
    type: mongoose.Schema.ObjectId,
    ref: "savedPostsAndComments",
  },
  viewedPosts: {
    type: [mongoose.Schema.ObjectId],
    ref: "viewedPosts",
  },
  hiddenPosts: {
    type: [mongoose.Schema.ObjectId],
    ref: "hiddenPosts",
  },
  comments: {
    type: [mongoose.Schema.ObjectId],
    ref: "comments",
  },
  posts: {
    type: [mongoose.Schema.ObjectId],
    ref: "posts",
  },
  upvotes: {
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "comments",
      },
    ],
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "posts",
      },
    ],
  },
  downvotes: {
    comments: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "comments",
      },
    ],
    posts: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "posts",
      },
    ],
  },
  karma: {
    comments: {
      type: Number,
    },
    posts: {
      type: Number,
    },
  },
});

// middlewares
//password encryption
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});


//password reset token
userSchema.methods.createPasswordResetToken = function () {
  //1)create token
  const resetToken = crypto.randomBytes(32).toString("hex");
  //2)encrypt token
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; //convert 10min to milliseconds
  return resetToken; //returns token that should be sent to email
};

//compares the password entered by the user with the hashed password in the database
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};





const userModel = mongoose.model("users", userSchema);

module.exports = userModel;
