import test from 'ava';
import mysql from 'mysql';
import faker from 'faker';
import nconf from 'nconf';
import {randomBytes} from 'crypto';
nconf.env('__').argv().file({file: '../../../test-config.json'});
import {NotFoundError, ValidationError} from '../../../src/utils/cerr';



import UserModelFn from '../../../src/models/user';

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
  const UserModel = UserModelFn();
  const id = await UserModel.saveUser(testUser.email, testUser.username, testUser.password);
  testUser.id = id;
  t.context.data = testUser;
});

test('getUserByEmail', async function (t) {
  const UserModel = UserModelFn();
  const testUser = t.context.data;  
  const user = await UserModel.getUserByEmail(testUser.email);
  t.deepEqual(testUser, user);
});

test('getUserById', async function (t) {
  const UserModel = UserModelFn();
  const testUser = t.context.data;
  const user = await UserModel.getUserById(testUser.id);
  t.deepEqual(testUser, user);
});

test('getUserByUsernameOrEmail:Username', async function (t) {
  const UserModel = UserModelFn();
  const testUser = t.context.data;
  const user = await UserModel.getUserByUsernameOrEmail(testUser.username);
  t.deepEqual(testUser, user);
});

test('getUserByUsernameOrEmail:Email', async function (t) {
  const UserModel = UserModelFn();
  const testUser = t.context.data;
  const user = await UserModel.getUserByUsernameOrEmail(testUser.email);
  t.deepEqual(testUser, user);
});

test('ValidationError: Missing Type', async function (t) {
  const UserModel = UserModelFn();
  const err = await t.throws(function () { UserModel.getUserBy(null); }, 'TYPE REQUIRED');
});

test('ValidationError: Invalid Type', async function (t) {
  const UserModel = UserModelFn();
  UserModel.getUserBy('abcd')
    .catch(e => {
      t.deepEqual(e.message, 'INVALID TYPE OF abcd');
    });
});
