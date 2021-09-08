const express = require('express');
// needed when you have a parameter in your route defined in app.js
const router = express.Router({ mergeParams: true });

const reviews = require('../controllers/reviews');

const catchAsync = require('../utils/catchAsync');

const Campground = require('../models/campground');
const Review = require('../models/review');

const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');

router.post('/', validateReview, isLoggedIn, catchAsync(reviews.createReview));

router.delete(
   '/:reviewId',
   isLoggedIn,
   isReviewAuthor,
   catchAsync(reviews.deleteReview)
);

module.exports = router;
