const express = require('express');
const router = express.Router();

// middleware to process form of enctype enctype="multipart/form-data"
const multer = require('multer');
// const upload = multer({ dest: 'uploads/' }); // stores locally

const { storage } = require('../cloudinary');
const upload = multer({ storage }); // stores in cloudinary storage we set up

const campgrounds = require('../controllers/campgrounds');

const catchAsync = require('../utils/catchAsync');

const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');

router
   .route('/')
   .get(catchAsync(campgrounds.index))
   .post(
      isLoggedIn,
      upload.array('image'),
      validateCampground,
      catchAsync(campgrounds.createCampground)
   );

router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router
   .route('/:id')
   .get(catchAsync(campgrounds.showCampground))
   .put(
      isLoggedIn,
      isAuthor,
      upload.array('image'),
      validateCampground,
      catchAsync(campgrounds.updateCampground)
   )
   .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

router.get(
   '/:id/edit',
   isLoggedIn,
   isAuthor,
   catchAsync(campgrounds.renderEditForm)
);

// router.get('/', catchAsync(campgrounds.index));

// router.post(
//    '/',
//    isLoggedIn,
//    validateCampground,
//    catchAsync(campgrounds.createCampground)
// );

// router.get('/:id', catchAsync(campgrounds.showCampground));

// router.put(
//    '/:id',
//    isLoggedIn,
//    isAuthor,
//    validateCampground,
//    catchAsync(campgrounds.updateCampground)
// );

// router.delete(
//    '/:id',
//    isLoggedIn,
//    isAuthor,
//    catchAsync(campgrounds.deleteCampground)
// );

module.exports = router;
