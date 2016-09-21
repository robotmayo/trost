'use strict';
const exhbs = require('express-hbs');
const log = require('logbro');

const fireHook = require('../plugins/hook');

const _render = exhbs.express4();
const TemplateService = {
  cache : new Map(),
  templates : new Map()
};

module.exports = TemplateService;

/**
 * 
 * 
 * @typedef {object} TemplateRootObject
 * @property {string} path Path to the template
 * @property {number} sourceId Souce themes id
 */


/**
 * Register a template
 * @param {number} sourceThemeId Id of the source theme
 * @param {string} name Name/key for the template eg: index -> index.hbs
 * @param {string} path
 * @throws {Error}
 */
function registerTemplate(sourceThemeId, name, path){
  if(sourceThemeId == null) throw new Error('SourceID cannont be null');
  if(name == null || name == '') throw new Error('name cannot be empty');
  if(path == null || path == '') throw new Error('path cannot be empty');
  let templatesRoot = TemplateService.templates.get(name);
  if(!templatesRoot){
    templatesRoot = {
      active : {},
      _default : {}
    };
    TemplateService.templates.set(name, templatesRoot);
  }
  if(sourceThemeId === 0){
    // 0 is the default theme
    templatesRoot._default = {path, sourceThemeId};
  }
  templatesRoot.active = {path, sourceThemeId};
}
TemplateService.registerTemplate = registerTemplate;

/**
 * 
 * 
 * @param {res} res
 * @param {string} template
 * @param {object} options
 * @param {function(<Error|null>, html: string)} cb
 */
function render(res, template, options, cb){
  const opts = options || {};
  opts._locals = res.locals || {};
  opts.settings = {};
  log.info('Calling render')
  const templateRootObject = getTemplate(template);
  log.trace(templateRootObject);
  _render(templateRootObject.path, opts, function(err, html){
    cb(err, html);
  });
}
TemplateService.render = render;

function getTemplate(name){
  const t = TemplateService.templates.get(name);
  if(!t) throw new Error('Unable to find template of ' + name);
  return t.active ? t.active : t._default;
}

function renderMiddleware(req, res, next){
  res.trostRender = function(template, opts, cb){
    render(res, template, opts, function(err, html){
      if(cb) return cb(err, html);
      if(err) return req.next(err);
      res.send(html);
    });
  }
  next();
}
TemplateService.renderMiddleware = renderMiddleware;