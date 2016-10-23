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

beforeEach(async function () {
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

it('register', async function () {
  const UserModel = t.context.UserModel;
  const userID = await t.context.register();
  const user = await UserModel.getUserById(userID);
  expect(bcrypt.compareSync(t.context.testUser.password, user.password)).toBe(true);
});

it('login:username', async function () {
  const tc = t.context;
  const AuthService = tc.AuthService;
  const userID = await tc.register();
  tc.testUser.id = userID;
  const user = await AuthService.login(tc.testUser.username, tc.testUser.password);
  expect(user.id).toBe(tc.testUser.id);
});

it('login:email', async function () {
  const tc = t.context;
  const AuthService = tc.AuthService;
  const userID = await tc.register();
  tc.testUser.id = userID;
  const user = await AuthService.login(tc.testUser.email, tc.testUser.password);
  expect(user.id).toBe(tc.testUser.id);
});

it('localStrategy', async function(){
  const tc = t.context;
  const userId = await tc.register();
  const done = (err, userObj) => {
    expect({id: userId}).toEqual(userObj);
    expect(err).toBe(null);
  };
  await tc.AuthService.localStrategy(tc.testUser.username, tc.testUser.password, done);
  await tc.AuthService.localStrategy('-1', '', err => expect(err instanceof NotFoundError).toBe(true));
  await tc.AuthService.localStrategy(tc.testUser.username, '', err => expect(err instanceof ValidationError).toBe(true));
});

it('serializeUser', async function(){
  await t.context
  .AuthService
  .serializeUser({id: 99}, (err, userId) => {
    expect(userId).toBe(99);
    expect(err).toBe(null);
  });
});

it('deserializeUser', async function(){
  const tc = t.context;
  const userId = await tc.register();
  await tc.AuthService.deserializeUser(userId, (err, userData) => {
    expect(err).toBe(null);
    const userDataNoP = Object.assign(userData, {password: ''});
    const tuNoP = Object.assign(tc.testUser, {password: ''});
    tuNoP.id = userId;
    expect(userDataNoP).toEqual(tuNoP);
  });
  await tc.AuthService.deserializeUser(-1, err => expect(err instanceof NotFoundError).toBe(true));
});
