const mongoose = require('mongoose');
const settingsSchema = new mongoose.Schema({
  userProfile: {
    displayName: {
      type: String,
      default: '',
    },
    about: {
      type: String,
      default: '',
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
          unique: true,
          enum: [
            'facebook',
            'instagram',
            'twitter',
            'linkedin',
            'youtube',
            'tiktok',
            'pinterest',
            'tumblr',
            'reddit',
            'spotify',
            'discord',
            'other',
          ],
        },
        socialURL: {
          type: String,
        },
        username: {
          type: String,
        },
      },
    ],
  },
  safetyAndPrivacy: {
    blockedPeople: {
      type: [mongoose.Schema.ObjectId],
      ref: 'users',
    },
    blockedCommunities: {
      type: [mongoose.Schema.ObjectId],
      ref: 'subreddits',
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
      enum: ['hot', 'new', 'top', 'rising'],
      default: 'hot',
    },
    globalContentView: {
      type: String,
      enum: ['card', 'classic', 'compact'],
      default: 'card',
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
      enum: ['everyone', 'Accounts Older Than 30 Days', 'nobody'],
      default: 'everyone',
    },
    privateMessage: {
      type: String,
      enum: ['everyone', 'nobody'],
      default: 'everyone',
    },
  },
  notificationSettings: {
    privateMessages: {
      type: Boolean,
      default: true,
    },
    chatMessages: {
      type: Boolean,
      default: true,
    },
    chatRequests: {
      type: Boolean,
      default: true,
    },
    poll: {
      type: Map,
      of: String,
    },
    mentionsOfUsername: {
      type: Boolean,
      default: true,
    },
    commentsOnYourPost: {
      type: Boolean,
      default: true,
    },
    upvotesOnYourPost: {
      type: Boolean,
      default: true,
    },
    repliesToYourComments: {
      type: Boolean,
      default: true,
    },
    newFollowers: {
      type: Boolean,
      default: true,
    },
    modNotifications: {
      type: Boolean,
      default: true,
    },
    subredditsUserMods: {
      type: Map,
      of: {
        allowModNotifications: {
          type: Boolean,
          default: true,
        },
        activity: {
          activity: {
            newPosts: {
              type: Boolean,
              default: false,
            },
            postsWithUpvotes: {
              allowNotification: {
                type: Boolean,
                default: false,
              },
              advancedSetup: {
                type: Boolean,
                default: false,
              },
              numberOfUpvotes: {
                type: Number,
                default: 5,
              },
            },
            postsWithCommetns: {
              allowNotification: {
                type: Boolean,
                default: true,
              },
              advancedSetup: {
                type: Boolean,
                default: false,
              },
              numberOfComments: {
                type: Number,
                default: 3,
              },
            },
          },
        },
        reports: {
          posts: {
            allowNotification: {
              type: Boolean,
              default: true,
            },
            advancedSetup: {
              type: Boolean,
              default: false,
            },
            numberOfReports: {
              type: Number,
              default: 2,
            },
          },
          comments: {
            allowNotification: {
              type: Boolean,
              default: true,
            },
            advancedSetup: {
              type: Boolean,
              default: false,
            },
            numberOfReports: {
              type: Number,
              default: 2,
            },
          },
        },
      },
    },
  },
});
const settingsModel = mongoose.model('settings', settingsSchema);
module.exports = settingsModel;
