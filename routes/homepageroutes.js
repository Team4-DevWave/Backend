const express = require('express');
const homepageController = require('../controllers/homepagecontroller');
// eslint-disable-next-line new-cap
const homepageRouter = express.Router();

homepageRouter
    .route('/trending')
    .get(homepageController.trending);
homepageRouter
    .route('/subreddits_by_category')
    .get(homepageController.getSubredditsWithCategory);

module.exports = homepageRouter;
