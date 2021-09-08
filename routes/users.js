const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');

const users = require('../controllers/users');
const User = require('../models/user');

router
   .route('/register')
   .get(users.renderRegister)
   .post(catchAsync(users.register));

router
   .route('/login')
   .get(users.renderLogin)
   .post(
      //middleware to handle login
      passport.authenticate('local', {
         failureFlash: true,
         failureRedirect: '/login',
      }),
      users.login
   );

router.get('/logout', users.logout);

// router.get('/register', users.renderRegister);

// router.post('/register', catchAsync(users.register));

// router.get('/login', users.renderLogin);

// router.post(
//    '/login',
//    //middleware to handle login
//    passport.authenticate('local', {
//       failureFlash: true,
//       failureRedirect: '/login',
//    }),
//    users.login
// );

module.exports = router;
