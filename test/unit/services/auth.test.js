import test from 'ava';
import bcrypt from 'bcryptjs';
import {randomBytes} from 'crypto';

import nconf from 'nconf';
nconf.env('__').argv().file({file: '../../../test-config.json'});

import AuthServiceFn from '../../../src/services/auth';
import UserModelFn from '../../../src/models/user';
import {NotFoundError, ValidationError} from '../../../src/utils/cerr';

function genUser() {
  return {
    id: -1,
    email: randomBytes(8).toString('hex'),
    username: randomBytes(8).toString('hex'),
    password: randomBytes(8).toString('hex')
  };
}

test.beforeEach(async function (t) {
  const testUser = genUser();
  t.context.testUser = testUser;
  const AuthService = AuthServiceFn();
  const UserModel = UserModelFn();
  t.context.AuthService = AuthService;
  t.context.UserModel = UserModel;
  t.context.register = AuthService.register
    .bind(null,
    t.context.testUser.email,
    t.context.testUser.username,
    t.context.testUser.password);
});

test('register', async function (t) {
  const UserModel = t.context.UserModel;
  const userID = await t.context.register();
  const user = await UserModel.getUserById(userID);
  t.true(bcrypt.compareSync(t.context.testUser.password, user.password));
});

test('login:username', async function (t) {
  const tc = t.context;
  const AuthService = tc.AuthService;
  const userID = await tc.register();
  tc.testUser.id = userID;
  const user = await AuthService.login(tc.testUser.username, tc.testUser.password);
  t.is(user.id, tc.testUser.id);
});

test('login:email', async function (t) {
  const tc = t.context;
  const AuthService = tc.AuthService;
  const userID = await tc.register();
  tc.testUser.id = userID;
  const user = await AuthService.login(tc.testUser.email, tc.testUser.password);
  t.is(user.id, tc.testUser.id);
});

test('localStrategy', async function(t){
  const tc = t.context;
  const userId = await tc.register();
  const done = (err, userObj) => {
    t.deepEqual({id: userId}, userObj);
    t.is(err, null);
  };
  await tc.AuthService.localStrategy(tc.testUser.username, tc.testUser.password, done);
  await tc.AuthService.localStrategy('-1', '', err => t.true(err instanceof NotFoundError));
  await tc.AuthService.localStrategy(tc.testUser.username, '', err => t.true(err instanceof ValidationError));
});

test('serializeUser', async function(t){
  await t.context
  .AuthService
  .serializeUser({id: 99}, (err, userId) => {
    t.is(userId, 99);
    t.is(err, null);
  });
});

test('deserializeUser', async function(t){
  const tc = t.context;
  const userId = await tc.register();
  await tc.AuthService.deserializeUser(userId, (err, userData) => {
    t.is(err, null);
    const userDataNoP = Object.assign(userData, {password: ''});
    const tuNoP = Object.assign(tc.testUser, {password: ''});
    tuNoP.id = userId;
    t.deepEqual(userDataNoP, tuNoP);
  });
  await tc.AuthService.deserializeUser(-1, err => t.true(err instanceof NotFoundError));
});
