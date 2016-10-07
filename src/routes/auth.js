const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const log = require('logbro');
const session = require('express-session');

const AuthService = require('../services').AuthService;


const Auth = {};
module.exports = Auth;

Auth.init = function init(app) {
  app.use(session({secret: 'dontforgettoupdateme'}));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(function (req, res, next){
    if(req.user) {
      res.locals.user = req.user;
      res.locals.authenticated = true;
    }
    next();
  });
};

Auth.postRegister = function register(req, res, next) {
  if (!req.body.username) return res.redirect('/register');
  if (!req.body.password) return res.redirect('/register');
  if (!req.body.email) return res.redirect('/register');

  return AuthService.register(req.body.email, req.body.username, req.body.password)
    .then(userData => {
      req.login(userData, err => {
        if (err) return next(err);
        return res.redirect('/');
      });
    })
    .catch(err => {
      res.redirect('/');
      log.info(err.stack);
    });
};

Auth.getLogin = function login(req, res) {
  console.log(req.user);
  res.trostRender('login');
};

Auth.logout = function (req, res) {
  req.logout();
  res.redirect('/');
};

Auth.getRegister = function (req, res) {
  res.trostRender('register');
};



Auth.mountRoutes = function mountRoutes(router) {
  //TODO: Dynamically load multiple strategies, eg : let people login via twitter to post a commnet
  passport.use(new LocalStrategy(AuthService.localStrategy));
  passport.serializeUser(AuthService.serializeUser);
  passport.deserializeUser(AuthService.deserializeUser);
  //TODO: Properly handle redirects, eg send them back to the page they came from
  router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login'
  }));
  router.post('/register', Auth.postRegister);
  router.post('/logout', Auth.logout);
  router.get('/login', Auth.getLogin);
  router.get('/register', Auth.getRegister);
  return router;
};
