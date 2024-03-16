const express = require('express');
const subredditController = require('../controllers/subredditcontroller');

const router = express.Router();

router
    .route('/')
    .get(subredditController.getAllSubreddits)
    .post(subredditController.createSubreddit);


module.exports = router;
