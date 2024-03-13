const mongoose = require("mongoose");
const settingsSchema = new mongoose.Schema({
  userProfile: {
    profilePicture: {
      type: String,
      default: "",
    },
    displayName: {
      type: String,
      default: "",
    },
    about: {
      type: String,
      default: "",
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
  },
  safetyAndPrivacy: {
    blockedPeople: {
      type: [mongoose.Schema.ObjectId],
      ref: "users",
    },
    blockedCommunities: {
      type: [mongoose.Schema.ObjectId],
      ref: "subreddits",
    },
  },
  feedSettings: {
    matureContent: {
      type: Boolean,
      default: false,
    },
    autoplayMedia: {
      type: Boolean,
      default: true,
    },
    communityThemes: {
      type: Boolean,
      default: true,
    },
    communityContentSort: {
      type: String,
      enum: ["hot", "new", "top", "rising"],
      default: "hot",
    },
    globalContentView: {
      type: String,
      enum: ["card", "classic", "compact"],
      default: "card",
    },
    openPostInNewTab: {
      type: Boolean,
      default: false,
    },
  },
  emailSettings: {
    unsubscribe: {
      type: Boolean,
      default: false,
    },
    chatRequest: {
      type: Boolean,
      default: true,
    },
    newUserWelcome: {
      type: Boolean,
      default: true,
    },
    newFollowers: {
      type: Boolean,
      default: true,
    },
  },
  chatAndMessagingSettings: {
    chatRequest: {
      type: String,
      enum: ["everyone", "Accounts Older Than 30 Days", "nobody"],
      default: "everyone",
    },
    privateMessage: {
      type: String,
      enum: ["everyone", "nobody"],
      default: "everyone",
    },
  },
});
const settings = mongoose.model("settings", settingsSchema);
