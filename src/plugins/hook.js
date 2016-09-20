'use strict';

const Promise = require('bluebird');
const log = require('logbro');

const HOOK_TYPES = {
  FILTER : 'filter',
  STATIC : 'static',
  ACTION : 'action'
};
const HOOK_TYPES_ARR = [HOOK_TYPES.FILTER, HOOK_TYPES.STATIC, HOOK_TYPES.ACTION];
const Plugins = {
  hookMap : new Map()
};
module.exports = Plugins;

/**
 * Hooks come in 2 types action, filter, static
 */

/**
 * 
 * 
 * @param {number}   pluginID
 * @param {object}   opts
 * @param {string}   opts.hook
 * @param {number}   opts.priority
 * @param {function} opts.fn
 * @returns {Promise<Resolve|Error>}
 */
function addHook(pluginID, opts){
  if(pluginID == null) return Promise.reject(new Error('PluginID required'));
  if(opts == null) return Promise.reject(new Error('opts is required'));
  if(!opts.hook || typeof opts.hook !== 'string') return Promise.reject(new Error('Hook is required'));
  if(!opts.fn || typeof opts.fn !== 'function') return Promise.reject(new Error('fn is required'));
  const data = Object.assign({}, opts);
  data.priority = typeof data.priority === 'number' ? data.priority : 5;
  data.id = pluginID;
  if(!Plugins.hookMap.has(data.hook)) Plugins.hookMap.set(data.hook, []);
  Plugins.hookMap.get(data.hook).push(data);
  return Promise.resolve();
}
Plugins.addHook = addHook;

function fireHook(hook, context){
  const hookType = hook.split('::')[0];
  if(HOOK_TYPES.indexOf(hookType) === -1) return Promise.reject(new Error('Invalid hooktype'));
  const hooks = Plugins.hookMap.get(hook);
  if(!hooks) return Promise.resolve(context);
  if(hookType === HOOK_TYPES.FILTER) return fireFilterHook(hooks, context);
  else if(hookType === HOOK_TYPES.STATIC) return fireStaticHook(hooks, context);
  else if(hookType === HOOK_TYPES.ACTION) return fireActionHook(hooks, context);
}
Plugins.fireHook = fireHook;

function fireFilterHook(hooks, context){
  return Promise.reduce(hooks, function(accum, data){
    return data.fn(accum);
  }, context);
}
Plugins.fireFilterHook = fireFilterHook;

function fireStaticHook(hooks, context){
  return Promise.each(hooks, function(data){
    return data.fn(context)
    .timeout(5000)
    .catch(Promise.TimeoutError, function(err){
      log.error('Plugin failed to finish in time');
    })
    .catch(function(err){
      log.error('Plugin failure');
    })
  });
}
Plugins.fireStaticHook = fireStaticHook;

function fireActionHook(hooks, context){
  return Promise.all(hooks.map(d => d.fn(context)));
}
Plugins.fireActionHook = fireActionHook;






