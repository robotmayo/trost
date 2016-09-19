'use strict';

const Promise = require('bluebird');

const Plugins = {
  hookMap : new Map()
};

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
  if(opts == null) return Promise.reject(new Error('opts is required'));
  if(!opts.hook || typeof opts.hook === 'string') return Promise.reject(new Error('Hook is required'));
  if(!opts.fn || typeof opts.fn !== 'function') return Promise.reject(new Error('fn is required'));
  const data = Object.assign({}, opts);
  data.priority = typeof data.priority === 'number' ? data.priority : 5;
  data.id = pluginID;
  if(!Plugins.hookMap.has(data.hook)) Plugins.hookMap.set(data.hook, []);
  Plugins.hookMap.get(data.hook).push(data);
}