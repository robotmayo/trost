import test from 'ava';
import mysql from 'mysql';

const pool = mysql.createPool(require('../config.test.json'));

import UserServiceFn from '../../src/services/user';

test('getUserById', async function(t){
  t.pass();
});
