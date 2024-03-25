const express = require('express');
const subredditController = require('../controllers/subredditcontroller');
const authController = require('./../controllers/authcontroller');

const router = express.Router();

router.use(authController.protect);


router
    .route('/')
    .get(subredditController.getAllSubreddits);

router
    .route('/:subreddit/subscribe').post(subredditController.joinSubreddit);

router
    .route('/create_community').post(subredditController.createCommunity);

module.exports = router;
