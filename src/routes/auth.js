const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const log = require('logbro');
const session = require('express-session');

const AuthService = require('../services').AuthService;


const Auth = {};
module.exports = Auth;

Auth.init = function init(app){
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(session());
};

Auth.register = function register(req, res, next){
  if(!req.body.username) return res.redirect('/register');
  if(!req.body.password) return res.redirect('/register');
  if(!req.body.email) return res.redirect('/register');
  const registerData = {
    username: req.body.user,
    password: req.body.password,
    email: req.body.email
  };
  return Auth.registerUser(registerData)
  .then(userData => {
    req.login(userData, err => {
      if(err) return next(err);
      return res.redirect('/');
    });
  })
  .catch(err => {
    res.redirect('/');
    log.info(err.stack);
  });
};

Auth.login = function login(req, res){
  return res.trostRender('login');
};

Auth.logout = function(req, res){
  req.logout();
  res.redirect('/');
};


Auth.mountRoutes = function mountRoutes(router){
  //TODO: Dynamically load multiple strategies, eg : let people login via twitter to post a commnet
  passport.use(new LocalStrategy(AuthService.passportLogin));
  //TODO: Properly handle redirects, eg send them back to the page they came from
  router.post('/login', passport.authenticate('local', {successRedirect: '/', failureRedirect: '/login'}));
  router.post('/register', Auth.register);
  router.post('/logout', Auth.logout);
  router.get('/login', Auth.login);
  return router;
};
