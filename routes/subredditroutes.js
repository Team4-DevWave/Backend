const express = require('express');
const subredditController = require('../controllers/subredditcontroller');
const authController = require('./../controllers/authcontroller');

const router = express.Router();

router.use(authController.protect);


router
    .route('/')
    .get(subredditController.getAllSubreddits)
    .post(subredditController.createSubreddit);

router
    .route('/:subreddit/subscribe')
    .post();

module.exports = router;
