const express = require('express');
const subredditController = require('../controllers/subredditcontroller');
const authController = require('./../controllers/authcontroller');

const router = express.Router();

router.use(authController.protect);


router
    .route('/create_community').post(subredditController.createCommunity);

// router.use('/:subreddit/subscribe', authController.checkSubredditAccess('post'));
// router.use('/', authController.checkSubredditAccess('post'));

router
    .route('/:subreddit/subscribe').post(subredditController.joinSubreddit);


module.exports = router;
