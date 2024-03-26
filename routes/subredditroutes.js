const express = require('express');
const subredditController = require('../controllers/subredditcontroller');
const authController = require('./../controllers/authcontroller');
// eslint-disable-next-line new-cap
const subredditRouter = express.Router();
subredditRouter.use(authController.protect);

subredditRouter
    .route('/all')
    .get(subredditController.getAllSubreddits);
subredditRouter
    .route('/create')
    .post(subredditController.createSubreddit);
subredditRouter
    .route('/:category')// QUERY MIGHT BE BETTER IN ALL ROUTE
    .get(subredditController.getSubredditsOfCategory);
subredditRouter
    .route('/:subreddit')
    .get(subredditController.getSubreddit);
subredditRouter
    .route('/:subreddit/posts')
    .get(subredditController.getPostsBySubreddit);
subredditRouter
    .route('/:subreddit/subscribe')
    .post(subredditController.subscribeToSubreddit);
subredditRouter
    .route('/:subreddit/unsubscribe')
    .delete(subredditController.unsubscribeToSubreddit);
subredditRouter
    .route('/:subreddit/rules')
    .get(subredditController.getSubredditRules);

module.exports = subredditRouter;
