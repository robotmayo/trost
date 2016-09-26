const bcrypt = require('bcryptjs');

const UserService = require('./user');

const AuthService = {
  SECRET: 'donttusttheclownq'
};
module.exports = AuthService;

AuthService.login = function AuthLogin(username, password, done){
  const hashedPW = bcrypt.hashSync(password);
  return UserService.saveUser({username, password: hashedPW})
  .then(user => done(null, user))
  .catch(done);
};

