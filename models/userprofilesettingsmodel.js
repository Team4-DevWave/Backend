const mongoose = require("mongoose");

const userProfileSettingSchema = new mongoose.Schema({
  profilePicture: {
    type: String,
  },
  displayName: {
    type: String,
  },
  about: {
    type: String,
  },
  NSFW: {
    type: Boolean,
    default: false,
  },
  allowFollowers: {
    type: Boolean,
    default: true,
  },
  contentVisibility: {
    type: Boolean,
    default: true,
  },
  activeCommunitiesVisibility: {
    type: Boolean,
    default: true,
  },
  socialLinks: [
    {
      socialType: {
        type: String,
        enum: [
          "facebook",
          "instagram",
          "twitter",
          "linkedin",
          "youtube",
          "tiktok",
          "pinterest",
          "tumblr",
          "reddit",
          "other",
        ],
      },
      socialURL: {
        type: String,
      },
    },
  ],
});

const userProfileSettingModel = mongoose.model(
  "userProfileSettings",
  userProfileSettingSchema
);

module.exports = userProfileSettingModel;
