if (process.env.NODE_ENV !== 'production') {
   require('dotenv').config();
}

// BASIC REQUIRES
const express = require('express');
const app = express();

// OTHER REQUIRES
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const MongoDBStore = require('connect-mongo');

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';

// UTILS
const ExpressError = require('./utils/ExpressError');

// MONGO
const mongoose = require('mongoose');
mongoose.connect(dbUrl);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => console.log('Database connected'));

// MODELS
const User = require('./models/user');

// VIEWS ENGINE
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize());

const secret = process.env.SECRET || 'thisshouldbeabettersecret!';
// SESSION
const store = MongoDBStore.create({
   mongoUrl: dbUrl,
   secret: secret,
   touchAfter: 24 * 60 * 60,
});

store.on('error', (e) => {
   console.log('SESSION STORE ERROR', e);
});

const sessionConfig = {
   // adding a name so it's different from the default
   store,
   name: 'session',
   secret: secret,
   resave: false,
   saveUninitialized: true,
   cookie: {
      httpOnly: true,
      // use it when deploy (https)
      // secure: true,
      expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
      maxAge: 1000 * 60 * 60 * 24 * 7,
   },
};
app.use(session(sessionConfig));

// PASSPORT
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// FLASH
app.use(flash());
app.use((req, res, next) => {
   // console.log(
   //    `Path: ${req.method} ${req.path} \nOriginal: ${req.originalUrl} \nReturnTo: ${req.session.returnTo}\n-------------------------`
   // );
   if (
      req.method === 'GET' &&
      !['/login', '/', '/register'].includes(req.originalUrl)
   ) {
      req.session.returnTo = req.originalUrl;
   }
   res.locals.success = req.flash('success');
   res.locals.error = req.flash('error');
   res.locals.currentUser = req.user;
   next();
});

//HELMET
app.use(helmet());

const scriptSrcUrls = [
   'https://stackpath.bootstrapcdn.com/',
   'https://api.tiles.mapbox.com/',
   'https://api.mapbox.com/',
   'https://kit.fontawesome.com/',
   'https://cdnjs.cloudflare.com/',
   'https://cdn.jsdelivr.net',
];

const styleSrcUrls = [
   'https://kit-free.fontawesome.com/',
   'https://cdn.jsdelivr.net',
   'https://api.mapbox.com/',
   'https://api.tiles.mapbox.com/',
   'https://fonts.googleapis.com/',
   'https://use.fontawesome.com/',
];

const connectSrcUrls = [
   'https://api.mapbox.com/',
   'https://a.tiles.mapbox.com/',
   'https://b.tiles.mapbox.com/',
   'https://events.mapbox.com/',
];

const fontSrcUrls = [];
app.use(
   helmet.contentSecurityPolicy({
      directives: {
         defaultSrc: [],
         connectSrc: ["'self'", ...connectSrcUrls],
         scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
         styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
         workerSrc: ["'self'", 'blob:'],
         objectSrc: [],
         imgSrc: [
            "'self'",
            'blob:',
            'data:',
            'https://res.cloudinary.com/dbrqthkfb/',
            'https://res.cloudinary.com/douqbebwk/',
            'https://images.unsplash.com/',
         ],
         fontSrc: ["'self'", ...fontSrcUrls],
      },
   })
);

// ROUTES
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);
app.use('/', userRoutes);

app.get('/', (req, res) => {
   res.render('home');
});

app.all('*', (req, res, next) => {
   next(new ExpressError('Page Not Found', 404));
});

app.use((err, req, res, next) => {
   const { status = 505, message = 'Something went wrong' } = err;
   if (!err.message) err.message = 'Oh No, Something Went Wrong!';
   res.status(status).render('error', { err });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`SERVING ON PORT ${port}`));
