const express = require('express');
const homepageController = require('../controllers/homepagecontroller');
const authController = require('./../controllers/authcontroller');
const homepageRouter = express.Router();

homepageRouter.use(authController.protect);


homepageRouter
    .route('/').get(homepageController.getCommunities);


homepageRouter
    .route('/:userorsubreddit/:subreddtnam_or_username').post(homepageController.createPost);

module.exports = homepageRouter;
