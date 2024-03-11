const mongoose = require("mongoose");

const userFeedSettingSchema = new mongoose.Schema({
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
  },
  globalContentView: {
    type: String,
    enum: ["card", "classic", "compact"],
  },
  openPostInNewTab:{
    type: Boolean,
    default: false,
  },

});

const userFeedSettingModel = mongoose.model(
  "userFeedSettings",
  userFeedSettingSchema
);

module.exports = userFeedSettingModel;
