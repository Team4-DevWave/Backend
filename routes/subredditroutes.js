const express = require('express');
const subredditController = require('../controllers/subredditcontroller');
const authController = require('./../controllers/authcontroller');
const postRouter = require('./postroutes');
// eslint-disable-next-line new-cap
const subredditRouter = express.Router();
subredditRouter.use('/:subredditid/posts', postRouter); // NEEDS REVIEW


subredditRouter
    .route('/all')
    .get(subredditController.getAllSubreddits); // TODO exclude private subs
subredditRouter
    .route('/:subreddit/search')
    .get(subredditController.searchSubreddit);
subredditRouter.get('/:subreddit/top', subredditController.getTopPostsBySubreddit);
subredditRouter.get('/:subreddit/hot', subredditController.getHotPostsBySubreddit);
subredditRouter.get('/:subreddit/new', subredditController.getNewPostsBySubreddit);
subredditRouter.get('/:subreddit/random', subredditController.getRandomPostsBySubreddit);
subredditRouter.use(authController.protect);
subredditRouter
    .route('/create')
    .post(subredditController.createSubreddit);
subredditRouter
    .route('/user_subreddits')
    .get(subredditController.getUserSubreddits);
subredditRouter
    .route('/:subreddit')
    .get(subredditController.getSubreddit);
subredditRouter
    .route('/:subreddit/subscribe')
    .post(subredditController.subscribeToSubreddit);
subredditRouter
    .route('/:subreddit/unsubscribe')
    .delete(subredditController.unsubscribeToSubreddit);
subredditRouter
    .route('/:subreddit/rules')
    .get(subredditController.getSubredditRules);
subredditRouter.delete('/:subreddit/delete', subredditController.deleteSubreddit);

module.exports = subredditRouter;
