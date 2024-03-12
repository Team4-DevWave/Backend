const mongoose = require("mongoose");

const userEmailSettingSchema = new mongoose.Schema({
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
});

const userEmailSettingModel = mongoose.model(
  "userEmailSettings",
  userEmailSettingSchema
);

module.exports = userEmailSettingModel;
