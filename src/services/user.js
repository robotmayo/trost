const {ValidationError} = require('../utils/cerr');
const query = require('../utils/query');

const SAVE_USER = `
  INSERT INTO trost_users SET email = ?, username = ?, password = ?;
`;

const GET_BY_EMAIL = `
  SELECT id, email, username, password FROM trost_users
  WHERE email = ?;
`;

const GET_BY_ID = `
  SELECT id, email, username, password FROM trost_users
  WHERE id = ?;
`;

module.exports = function (userOpts) {
  const UserService = Object.assign({connection: null}, userOpts);

  UserService.saveUser = function saveUser(email, username, password) {
    if (!email) throw new ValidationError('EMAIL REQUIRED');
    if (!password) throw new ValidationError('PASSWORD REQUIRED');
    if (!username) throw new ValidationError('USERNAME REQUIRED');
    return query(UserService.connection, SAVE_USER, [email, username, password])
      .then(results => results.insertId); //TODO: Handle insert failures
  };

  UserService.getUserBy = function getUserBy(type, ...args) {
    if (!type) throw new ValidationError('TYPE REQUIRED');
    switch (type) {
      case 'email':
        return query(UserService.connection, GET_BY_EMAIL, args);
      case 'id':
        return query(UserService.connection, GET_BY_ID, args);
      default:
        return Promise.reject(new ValidationError(`INVALID TYPE OF ${type}`));
    }
  };

  UserService.getUserByEmail = UserService.getUserBy.bind(null, 'email');
  UserService.getUserById = UserService.getUserBy.bind(null, 'id');

  return UserService;
};
