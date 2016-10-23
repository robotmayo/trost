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

beforeEach(async function () {
  const testUser = genUser();
  const UserModel = UserModelFn();
  const id = await UserModel.saveUser(testUser.email, testUser.username, testUser.password);
  testUser.id = id;
  t.context.data = testUser;
});

it('getUserByEmail', async function () {
  const UserModel = UserModelFn();
  const testUser = t.context.data;  
  const user = await UserModel.getUserByEmail(testUser.email);
  expect(testUser).toEqual(user);
});

it('getUserById', async function () {
  const UserModel = UserModelFn();
  const testUser = t.context.data;
  const user = await UserModel.getUserById(testUser.id);
  expect(testUser).toEqual(user);
});

it('getUserByUsernameOrEmail:Username', async function () {
  const UserModel = UserModelFn();
  const testUser = t.context.data;
  const user = await UserModel.getUserByUsernameOrEmail(testUser.username);
  expect(testUser).toEqual(user);
});

it('getUserByUsernameOrEmail:Email', async function () {
  const UserModel = UserModelFn();
  const testUser = t.context.data;
  const user = await UserModel.getUserByUsernameOrEmail(testUser.email);
  expect(testUser).toEqual(user);
});

it('ValidationError: Missing Type', async function () {
  const UserModel = UserModelFn();
  const err = await expect(function () { UserModel.getUserBy(null); }).toThrowError('TYPE REQUIRED');
});

it('ValidationError: Invalid Type', async function () {
  const UserModel = UserModelFn();
  UserModel.getUserBy('abcd')
    .catch(e => {
      expect(e.message).toEqual('INVALID TYPE OF abcd');
    });
});
