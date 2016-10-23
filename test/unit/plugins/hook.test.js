const Promise = require('bluebird');
//Seems using 'native' promises doesnt work
//when rejecting an async function?

const Hook = require('../../../src/plugins/hook');
const {ValidationError} = require('../../../src/utils/cerr');
const noop = f => f;

describe('Plugins.addHook', function(){
  const Plugins = Hook({});
  const table = [
    {__id: 'noPluginId', pluginID: null, opts: null, expected: [ValidationError, /PluginID required/]},
    {__id: 'missingOpts', pluginID: 0, opts: null, expected: [ValidationError, /hookObject is required/]},
    {__id: 'missingHook', pluginID: 0, opts: {}, expected: [ValidationError, /Hook is required/]},
    {__id: 'hookMustBeString', pluginID: 0, opts: {hook: 42}, expected: [ValidationError, /Hook is required/]},
    {__id: 'hookFnMissing', pluginID: 0, opts: {hook: ''}, expected: [ValidationError, /Hook is required/]},
    {
      __id: 'hookFnMustBeFunction', 
      pluginID: 0, 
      opts: {hook: 'f', fn: null}, 
      expected: [ValidationError, /fn is required/]
    }
  ];
  table.forEach(item => {
    it(item.__id, function(){
      expect(() => Plugins.addHook(item.pluginID, item.opts)).toThrowError(item.expected[0]);
      expect(() => Plugins.addHook(item.pluginID, item.opts)).toThrowError(item.expected[1]);
    });
  });

  it('adds a hook', function(){
    const hook = 'filter::test';
    Plugins.addHook(0, {hook, fn: noop});
    const h = Plugins.hookMap.get(hook);
    expect(h[0].fn).toEqual(noop);
  });
});

describe('Plugins.fireHook', function(){
  const Plugins = Hook({});
  it('should throw on invalid hooktype', function(done){
    Plugins.addHook(0, {hook: 'broken::test', fn: noop});
    return Plugins.fireHook('broken::test')
    .then(() => done.fail())
    .catch(err => {
      expect(err).toBeInstanceOf(ValidationError);
      expect(err.message).toMatch(/Invalid hooktype/);
      done();
    });
  });

  it('should call a proper hook', function(){
    const hfn = jest.fn();
    Plugins.addHook(0, {hook: 'reduce::good', fn: hfn});
    return Plugins.fireHook('reduce::good', Symbol(''))
    .then(() => {
      expect(hfn).toHaveBeenCalled();
    });
  });
});

// it('fireHook:fireXHook', async function(){
//   const Plugins = Hook({});
//   const passedContext = Symbol('fireHook:fireReduceHook');
//   const fn = ctx => {
//     expect(ctx).toBe(passedContext);
//   };
//   Plugins.addHook(0, {hook: 'reduce::test', fn});
//   Plugins.addHook(0, {hook: 'action::test', fn});
//   Plugins.addHook(0, {hook: 'static::test', fn});
//   await Plugins.fireHook('reduce::test', passedContext);
//   await Plugins.fireHook('action::test', passedContext);
//   await Plugins.fireHook('static::test', passedContext);
// });


// it('removeHook', function(){
//   const Plugins = Hook({});
//   const noRemove = a => a;
//   const removeMe = b => b;
//   const hook = 'reduce::derp';
//   Plugins.addHook(0, {hook: hook, fn: noRemove});
//   Plugins.addHook(0, {hook: hook, fn: noRemove});
//   Plugins.addHook(0, {hook: hook, fn: removeMe});
//   const removed = Plugins.removeHook(hook, removeMe);
//   expect(removed).toBe(true);
//   expect(Plugins.hookMap.get(hook).length).toBe(2);
//   expect(Plugins.removeHook()).toBe(false);
//   expect(Plugins.removeHook(hook)).toBe(false);
//   expect(Plugins.removeHook(hook, c => c)).toBe(false);
// });

// it('fireReduceHook', async function(){
//   const Plugins = Hook({});
//   const rHook = 'reduce::testa';
//   const adder = i => i + 1;
//   for(let i = 0; i < 10; i++){
//     Plugins.addHook(0, {hook: rHook, fn: adder});
//   }
//   const res = await Plugins.fireHook(rHook, 0);
//   expect(res).toBe(10);
// });

// it('fireReduceHook:throws', async function(done){
//   const Plugins = Hook({});
//   const throwHook = 'reduce::testb';
//   const throws = () => {
//     return Promise.reject(new Error('THROWN'));
//   };
//   Plugins.addHook(0, {hook: throwHook, fn: throws});
//   try{
//     await Plugins.fireHook(throwHook, Symbol('context'));
//     done.fail();
//   }catch(e){
//     expect(e.message).toBe('THROWN');
//   }
// });

// it('fireStaticHook', async function(){
//   const Plugins = Hook({});
//   const staticHook = 'static::test';
//   const staticContext = Symbol('StaticContext');
//   t.plan(10);
//   for(let i = 0; i < 10; i++){
//     Plugins.addHook(0, {hook: staticHook, fn: ctx => expect(ctx).toBe(staticContext)});
//   }
//   await Plugins.fireHook(staticHook, staticContext);
// });

// it('fireStaticHook:timeout', async function(){
//   const Plugins = Hook({});
//   t.plan(2);
//   const staticHook = 'static::test';
//   const staticContext = Symbol('StaticContext');
//   const timesoutFn = ctx => {
//     expect(ctx).toBe(staticContext);
//     return Promise.delay(6000);
//   };
//   const regularFn = ctx => {
//     expect(ctx).toBe(staticContext);
//   };
//   // Delayed hook shouldnt slowdown the others
//   // need a way to test errored out :/
//   Plugins.addHook(0, {hook: staticHook, fn: timesoutFn});
//   Plugins.addHook(0, {hook: staticHook, fn: regularFn});
//   await Plugins.fireHook(staticHook, staticContext);
// });

// it('fireActionHook', async function(){
//   const Plugins = Hook({});
//   const rHook = 'action::test';
//   const staticContext = Symbol('static');
//   t.plan(11);
//   const callMe = ctx => expect(ctx).toBe(staticContext);
//   for(let i = 0; i < 10; i++){
//     Plugins.addHook(0, {hook: rHook, fn: callMe});
//   }
//   const res = await Plugins.fireHook(rHook, staticContext);
//   expect(res.length).toBe(10);
// });
