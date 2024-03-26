const express = require('express');
const homepageController = require('../controllers/homepagecontroller');
const authController = require('./../controllers/authcontroller');
const homepageRouter = express.Router();

homepageRouter.use(authController.protect);


homepageRouter
    .route('/submit').get(homepageController.getCommunities);


homepageRouter
    .route('/submit/:userorsubreddit/:subreddtnam_or_username').post(homepageController.createPost);

homepageRouter
    .route('/create_community').post(homepageController.createCommunity);

module.exports = homepageRouter;
