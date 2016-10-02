import test from 'ava';

import capture from '../../../src/utils/capture';

test('capture', function(t){
  const c = capture(() => {
    throw new Error();
  });
  t.truthy(c.err);
  const v = capture(() => 'works');
  t.is(v.value, 'works');
});
