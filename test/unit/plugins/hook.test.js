import test from 'ava';
import Promise from 'bluebird';
//Seems using 'native' promises doesnt work
//when rejecting an async function?

import Hook from '../../../src/plugins/hook';
import {ValidationError} from '../../../src/utils/cerr';


test('Plugins.addHook', function(t){
  const Plugins = Hook({});
  t.throws(() => Plugins.addHook(null), 'PluginID required', 'addHook should not pass when pluginID is null');

  t.throws(
    () => Plugins.addHook(0, null),
    'opts is required',
    'addHook should not pass when opts is missing'
  );

  t.throws(
    () => Plugins.addHook(0, {}),
    'Hook is required',
    'addHook should not pass when opts.hook is missing'
  );

  t.throws(
    () => Plugins.addHook(0, {hook: 't'}),
    'fn is required',
    'addHook should not pass when fn is missing',
    'addHook opts.fn missing'
  );

  t.throws(
    () => Plugins.addHook(0, {hook: 22}),
    'Hook is required',
    'addHook should not pass when hook is not a string',
    'addHook opts.hook is not string'
  );

  t.throws(
    () => Plugins.addHook(0, {hook: 't', fn: ''}),
    'fn is required',
    'addHook should not pass when fn is not a function',
    'addHook opts.fn is not string'
  );
  
  Plugins.addHook(0, {hook: 'filter::test', fn: () => true});
  const h = Plugins.hookMap.get('filter::test');
  t.truthy(h[0].fn(), 'Hook should get added to map');

});

test('fireHook', async function(t){
  const noop = f => f;
  const Plugins = Hook({});
  Plugins.addHook(0, {hook: 'broken::test', fn: noop});
  try{
    await Plugins.fireHook('broken::test');
    t.fail();
  }catch(e){
    t.true(e instanceof ValidationError);
    t.is(e.message, 'Invalid hooktype');
  }
  const ctx = Symbol('ResolveWithThis');
  const res = await Plugins.fireHook('reduce::nonexists', ctx);
  t.is(ctx, res);
});

test('fireHook:fireXHook', async function(t){
  const Plugins = Hook({});
  const passedContext = Symbol('fireHook:fireReduceHook');
  const fn = ctx => {
    t.is(ctx, passedContext);
    t.pass();
  };
  Plugins.addHook(0, {hook: 'reduce::test', fn});
  Plugins.addHook(0, {hook: 'action::test', fn});
  Plugins.addHook(0, {hook: 'static::test', fn});
  await Plugins.fireHook('reduce::test', passedContext);
  await Plugins.fireHook('action::test', passedContext);
  await Plugins.fireHook('static::test', passedContext);
});


test('removeHook', function(t){
  const Plugins = Hook({});
  const noRemove = a => a;
  const removeMe = b => b;
  const hook = 'reduce::derp';
  Plugins.addHook(0, {hook: hook, fn: noRemove});
  Plugins.addHook(0, {hook: hook, fn: noRemove});
  Plugins.addHook(0, {hook: hook, fn: removeMe});
  const removed = Plugins.removeHook(hook, removeMe);
  t.true(removed);
  t.is(Plugins.hookMap.get(hook).length, 2);
  t.false(Plugins.removeHook());
  t.false(Plugins.removeHook(hook));
  t.false(Plugins.removeHook(hook, c => c));
});

test('fireReduceHook', async function(t){
  const Plugins = Hook({});
  const rHook = 'reduce::testa';
  const adder = i => i + 1;
  for(let i = 0; i < 10; i++){
    Plugins.addHook(0, {hook: rHook, fn: adder});
  }
  const res = await Plugins.fireHook(rHook, 0);
  t.is(res, 10);
});

test('fireReduceHook:throws', async function(t){
  const Plugins = Hook({});
  const throwHook = 'reduce::testb';
  const throws = () => {
    console.log('FFFF');
    return Promise.reject(new Error('THROWN'));
  };
  Plugins.addHook(0, {hook: throwHook, fn: throws});
  try{
    await Plugins.fireHook(throwHook, Symbol('context'));
    t.fail();
  }catch(e){
    t.is(e.message, 'THROWN');
  }
});

