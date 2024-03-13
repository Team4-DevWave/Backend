const express = require("express");
const messageController = require("../controllers/messagecontroller");

const router = express.Router();

router
  .route("/")
  .get(messageController.getAllmessages)
  .post(messageController.createmessage);

module.exports = router;
