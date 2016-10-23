import capture from '../../../src/utils/capture';

it('capture', function(){
  const c = capture(() => {
    throw new Error();
  });
  expect(c.err).toBeTruthy();
  const v = capture(() => 'works');
  expect(v.value).toBe('works');
});
