import test from 'ava';
import Plugins from '../../src/plugins/hook';

test('Plugins.addHook', function(t){
  function failIsSucc(p,succMessage, errMessage, msg){
    return p.then(function(){
      t.fail(errMessage);
    })
    .catch(function(err){
      t.is(err.message, succMessage, msg);
    })
  }

  failIsSucc(
    Plugins.addHook(null),
    'PluginID required',
    'addHook should not pass when pluginID is null'
  );

  failIsSucc(
    Plugins.addHook(0, null),
    'opts is required',
    'addHook should not pass when opts is missing'
  );

  failIsSucc(
    Plugins.addHook(0, {}),
    'Hook is required',
    'addHook should not pass when opts.hook is missing'
  );

  failIsSucc(
    Plugins.addHook(0, {hook : 't'}),
    'fn is required',
    'addHook should not pass when fn is missing',
    'addHook opts.fn missing'
  );

  failIsSucc(
    Plugins.addHook(0, {hook : 22}),
    'Hook is required',
    'addHook should not pass when hook is not a string',
    'addHook opts.hook is not string'
  );

  failIsSucc(
    Plugins.addHook(0, {hook : 't', fn : ''}),
    'fn is required',
    'addHook should not pass when fn is not a function',
    'addHook opts.fn is not string'
  );

  return Plugins.addHook(0, {hook : 'filter::test', fn : () => true})
  .then(function(){
    const h = Plugins.hookMap.get('filter::test');
    t.truthy(h[0].fn(), 'Hook should get added to map');
  })
  .catch(function(err){
    t.fail(err.stack);
  });

});