const bcrypt = require('bcryptjs');

const {ValidationError} = require('../utils/cerr');

module.exports = function(authOpts) {
  const UserModel = require('../models/user')();
  const AuthService = Object.assign({
    SECRET: 'donttusttheclownq'
  }, authOpts);

  AuthService.register = function register(email, username, password) {
    const hashedPW = bcrypt.hashSync(password);
    return UserModel.saveUser(email, username, hashedPW);
  };

  AuthService.login = function login(usernameOrEmail, password){
    return UserModel.getUserByUsernameOrEmail(usernameOrEmail)
    .then(user => {
      if(bcrypt.compareSync(password, user.password) === false){
        return Promise.reject(new ValidationError('INVALID PASSWORD'));
      }
      return user;
    });
  };

  AuthService.localStrategy = function localStrategy(usernameOrEmail, password, done) {
    AuthService.login(usernameOrEmail, password)
    .then(user => done(null, {id: user.id}))
    .catch(done);
  };

  AuthService.serializeUser = function serializeUser(user, done){
    done(null, user.id);
  };

  AuthService.deserializeUser = function deserializeUser(id, done){
    UserModel.getUserById(id)
    .then(userData => {
      done(null, userData);
    })
    .catch(done);
  };

  return AuthService;

};
