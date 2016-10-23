import query from '../../../src/utils/query';

it('query.js', async function(done){
  const expectedQueryString = 'SELECT * FROM stuff;';
  const expectedArgs = [1, 2, 3];
  const successFakeConn = {
    query: (queryString, args, cb) => {
      expect(queryString).toBe(expectedQueryString);
      args.every((item, ind) => expect(item).toBe(expectedArgs[ind]));
      cb(null, true);
    }
  };
  const shouldBeTrue = await query(successFakeConn, expectedQueryString, 1, 2, 3);
  expect(shouldBeTrue).toBe(true);
  try{
    await query({query: (_, __, cb) => cb(new Error())});
    done.fail();
  }catch(e){}
});
