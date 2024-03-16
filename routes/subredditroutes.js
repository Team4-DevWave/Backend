const express = require('express');
const subredditController = require('../controllers/subredditcontroller');
// eslint-disable-next-line new-cap
const router = express.Router();

router
    .route('/')
    .get(subredditController.getAllSubreddits)
    .post(subredditController.createSubreddit);


module.exports = router;
