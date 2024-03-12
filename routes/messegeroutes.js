const express = require("express");
const messegeController = require("../controllers/messegeController");

const router = express.Router();

router
  .route("/")
  .get(messegeController.getAllMesseges)
  .post(messegeController.createMessege);


module.exports = router;
