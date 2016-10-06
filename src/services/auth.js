const bcrypt = require('bcryptjs');

const UserService = require('./user');
const {ValidationError} = require('../utils/cerr');

module.exports = function(authOpts) {
  const AuthService = Object.assign({
    SECRET: 'donttusttheclownq'
  }, authOpts);

  AuthService.register = function register(email, username, password) {
    const hashedPW = bcrypt.hashSync(password);
    return UserService.saveUser(email, username, hashedPW);
  };

  AuthService.login = function login(email, password){
    UserService.getUserByEmail(email)
    .then(user => {
      if(bcrypt.compareSync(password, user.password) === false){
        return Promise.reject(new ValidationError('INVALID PASSWORD'));
      }
      return user;
    });
  };

  AuthService.localStrategy = function localStrategy(email, username, password, done) {
    AuthService.login(email, username, password)
    .then(user => done({id: user.id}))
    .catch(done);
  };

  AuthService.serialzeUser = function serialzeUser(user, done){
    done(null, user);
  };

  AuthService.deserializeUser = function deserializeUser(id, done){
    UserService.getUserById(id)
    .then(userData => {
      done(null, userData);
    })
    .catch(done);
  };

  return AuthService;

};
