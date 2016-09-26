const Promise = require('bluebird');
const log = require('logbro');

const HOOK_TYPES = require('./constants').HOOK_TYPES;
const HOOK_TYPES_ARR = [HOOK_TYPES.REDUCE, HOOK_TYPES.STATIC, HOOK_TYPES.ACTION];
const DEFAULT_PRIORITY = 5;

module.exports = function hookInit(Plugins) {
  /**
   * @memberOf Plugins
   * @type {Map<String,hookData>}
   */
  Plugins.hookMap = new Map();
  /**
 * 
 * @typedef {Object} hookData
 * @property {string} hook
 * @property {number} priority
 * @property {function(context:object):Promise<Any|Error>} fn
 * @property {number} id pluginID 
 */


  /**
   * @memberof Plugins
   * @param  {number}   pluginID
   * @param  {object}   opts
   * @param  {string}   opts.hook
   * @param  {number}   opts.priority
   * @param  {function} opts.fn
   * @throws {Error}
   */
  function addHook(pluginID, opts) {
    if (pluginID == null) throw new Error('PluginID required');
    if (opts == null) throw new Error('opts is required');
    if (!opts.hook || typeof opts.hook !== 'string') throw new Error('Hook is required');
    if (!opts.fn || typeof opts.fn !== 'function') throw new Error('fn is required');
    const data = Object.assign({}, opts);
    data.priority = typeof data.priority === 'number' ? data.priority : DEFAULT_PRIORITY;
    data.id = pluginID;
    if (!Plugins.hookMap.has(data.hook)) Plugins.hookMap.set(data.hook, []);
    Plugins.hookMap.get(data.hook).push(data);
  }
  Plugins.addHook = addHook;


  /**
   * 
   * @memberof Plugins
   * @param {hookData[]} hooks
   * @param {object} context
   * @returns {Promise<Any|Error>}
   */
  function fireReduceHook(hooks, context) {
    return Promise.reduce(hooks, function reduceHookFn(accum, data) {
      return data.fn(accum);
    }, context);
  }
  Plugins.fireReduceHook = fireReduceHook;

  /**
   * 
   * @memberof Plugins
   * @param {hookData[]} hooks
   * @param {object} context
   * @returns {Promise<Any|Error>}
   */
  function fireStaticHook(hooks, context) {
    return Promise.each(hooks, function staticHookEach(data) {
      return data.fn(context)
        .timeout(5000)
        .catch(Promise.TimeoutError, function (err) {
          log.error(`Plugin failed to finish in time ${err.stack}`);
        })
        .catch(function (err) {
          log.error(`Plugin failure ${err.stack}`);
        });
    });
  }
  Plugins.fireStaticHook = fireStaticHook;

  /**
   * 
   * @memberof Plugins
   * @param {hookData[]} hooks
   * @param {object} context
   * @returns {Promise<Any|Error>}
   */
  function fireActionHook(hooks, context) {
    return Promise.all(hooks.map(d => d.fn(context)));
  }
  Plugins.fireActionHook = fireActionHook;

   /**
   * 
   * @memberof Plugins
   * @param {string} hook
   * @param {object} context
   * @returns {Promise<Any|Error>}
   */
  function fireHook(hook, context) {
    const hookType = hook.split('::')[0];
    if (HOOK_TYPES_ARR.indexOf(hookType) === -1) return Promise.reject(new Error('Invalid hooktype'));
    const hooks = Plugins.hookMap.get(hook);
    if (!hooks) return Promise.resolve(context);
    if (hookType === HOOK_TYPES.REDUCE) return fireReduceHook(hooks, context);
    else if (hookType === HOOK_TYPES.STATIC) return fireStaticHook(hooks, context);
    else if (hookType === HOOK_TYPES.ACTION) return fireActionHook(hooks, context);
    return Promise.reject(new Error('Invalid hooktype'));
  }
  Plugins.fireHook = fireHook;

  return Plugins;

};

