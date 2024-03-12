const mongoose = require("mongoose");

const userSafetyPrivacySettingSchema = new mongoose.Schema({
  blockedPeople: {
    type: [mongoose.Schema.ObjectId],
    ref: "users",
  },
  blockedCommunities: {
    type: [mongoose.Schema.ObjectId],
    ref: "subreddits",
  },
});

const userSafetyPrivacySettingModel = mongoose.model(
  "userSafetyPrivacySettings",
  userSafetyPrivacySettingSchema
);

module.exports = userSafetyPrivacySettingModel;
