const express = require('express');
const homepageController = require('../controllers/homepagecontroller');
const authController = require('./../controllers/authcontroller');
const homepageRouter = express.Router();

homepageRouter.use(authController.protect);

homepageRouter
    .route('/').get(homepageController.getCommunities);


module.exports = homepageRouter;
