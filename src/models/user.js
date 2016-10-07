const {
  ValidationError,
  NotFoundError
} = require('../utils/cerr');
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

const GET_BY_USERNAME_OR_EMAIL = `
  SELECT id, email, username, password FROM trost_users
  WHERE username = ? OR email = ?
`;

function gotResults(msg) {
  return function (results) {
    if (results[0] == null) return Promise.reject(new NotFoundError(msg));
    return results[0];
  }
}

module.exports = function (userOpts) {
  const Model = Object.assign({ connection: require('../db') }, userOpts);

  Model.saveUser = function saveUser(email, username, password) {
    if (!email) throw new ValidationError('EMAIL REQUIRED');
    if (!username) throw new ValidationError('USERNAME REQUIRED');
    if (!password) throw new ValidationError('PASSWORD REQUIRED');
    return query(Model.connection, SAVE_USER, email, username, password)
      .then(results => results.insertId); //TODO: Handle insert failures
  };

  Model.getUserBy = function getUserBy(type, ...args) {
    if (!type) throw new ValidationError('TYPE REQUIRED');
    switch (type) {
      case 'email':
        return query(Model.connection, GET_BY_EMAIL, args)
          .then(gotResults('USER_NOT_FOUND'));
      case 'id':
        return query(Model.connection, GET_BY_ID, args)
          .then(gotResults('USER_NOT_FOUND'));
      case 'uoe':
        return query(Model.connection, GET_BY_USERNAME_OR_EMAIL, args[0], args[0])
          .then(gotResults('USER_NOT_FOUND'));
      default:
        return Promise.reject(new ValidationError(`INVALID TYPE OF ${type}`));
    }
  };

  Model.getUserByEmail = Model.getUserBy.bind(null, 'email');
  Model.getUserById = Model.getUserBy.bind(null, 'id');
  Model.getUserByUsernameOrEmail = Model.getUserBy.bind(null, 'uoe');

  return Model;
};
