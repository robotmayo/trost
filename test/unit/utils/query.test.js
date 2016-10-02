import test from 'ava';

import query from '../../../src/utils/query';

test('query.js', async function(t){
  const expectedQueryString = 'SELECT * FROM stuff;';
  const expectedArgs = [1, 2, 3];
  const successFakeConn = {
    query: (queryString, args, cb) => {
      t.is(queryString, expectedQueryString);
      args.every((item, ind) => t.is(item, expectedArgs[ind]));
      cb(null, true);
    }
  };
  const shouldBeTrue = await query(successFakeConn, expectedQueryString, 1, 2, 3);
  t.true(shouldBeTrue);
  try{
    await query({query: (_, __, cb) => cb(new Error())});
    t.fail();
  }catch(e){
    t.pass();
  }

});
