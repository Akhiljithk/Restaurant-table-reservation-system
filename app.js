var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var expressLayouts = require('express-ejs-layouts');
const session = require('express-session');

var adminRouter = require('./routes/admin');
// var usersRouter = require('./routes/users');

var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', './layouts/layout');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: 'SECRET' 
}))

app.use('/admin', adminRouter);
// app.use('/', usersRouter);

const isLoggedIn = (req, res, next) => {
  if (req.user) {
    next();
  } else {
    next()
      // res.status(401).send('Not Logged In');
    }
  }

app.get('/',isLoggedIn, function(req, res) {
  res.render('pages/auth');
});

app.get('/success', (req, res) => {
  res.render('pages/success', {user: userProfile});
});

app.get('/logout', function(req, res) {
  req.session.destroy((err) => {
    res.redirect('/') 
  })
});

app.get('/error', (req, res) => res.send("error logging in"));

/*  PASSPORT SETUP  */

const passport = require('passport');
var userProfile;

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

/*  Google AUTH  */
 
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const GOOGLE_CLIENT_ID = '610412597343-51g7u8pv84hv654s3cad9au9pocr7020.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = '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';
passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
      userProfile=profile;
      return done(null, userProfile);
  }
));
 
// app.get('/auth/google',passport.authenticate('google', { scope : ['profile', 'email'] }));

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/error' }),
  function(req, res) {
    // Successful authentication, redirect success.
    res.redirect('/success');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT,()=>{
  console.log('server running on port', PORT);
})


app.get('/auth/google',passport.authenticate('google', { scope : ['profile', 'email'] }));


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});




module.exports = app;
