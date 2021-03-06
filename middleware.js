const { campgroundSchema, reviewSchema } = require('./schemas');
const Campground = require('./models/campground');
const Review = require('./models/review');

const ExpressError = require('./utils/ExpressError');

module.exports.isLoggedIn = (req, res, next) => {
   if (!req.isAuthenticated()) {
      req.flash('error', 'You must be signed in');
      return res.redirect('/login');
   }
   next();
};

module.exports.validateCampground = (req, res, next) => {
   const { error } = campgroundSchema.validate(req.body);
   if (error) {
      const msg = error.details.map((el) => el.message).join(',');
      throw new ExpressError(msg, 400);
   } else {
      next();
   }
};

module.exports.isAuthor = async (req, res, next) => {
   const campground = await Campground.findById(req.params.id);
   if (!campground) {
      req.flash('error', 'Cannot find that campground!');
      return res.redirect('/campgrounds');
   }
   if (!campground.author.equals(req.user._id)) {
      req.flash('error', 'You do not have permission to do that');
      return res.redirect(`/campgrounds/${req.params.id}`);
   }
   next();
};

module.exports.validateReview = (req, res, next) => {
   const { error } = reviewSchema.validate(req.body);
   if (error) {
      const msg = error.details.map((el) => el.message).join(',');
      throw new ExpressError(msg, 400);
   } else {
      next();
   }
};

module.exports.isReviewAuthor = async (req, res, next) => {
   const review = await Review.findById(req.params.reviewId);
   if (!review) {
      req.flash('error', 'Cannot find that review!');
      return res.redirect('/campgrounds');
   }
   if (!review.author.equals(req.user._id)) {
      req.flash('error', 'You do not have permission to do that');
      return res.redirect(`/campgrounds/${req.params.id}`);
   }
   next();
};
