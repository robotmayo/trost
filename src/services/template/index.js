const exhbs = require('express-hbs');
const log = require('logbro');

const cerr = require('../../utils/cerr');

const themePath = require('path').join(__dirname, '../../theme');
const {
  ValidationError
} = cerr;

/**
 * 
 * @namespace TemplateService
 */

/**
 * 
 * 
 * @returns {object} 
 */
function _defaults() {
  return {
    cache: new Map(),
    templates: new Map(),
    themePath,
    hbsRender: exhbs.express4({
      layoutsDir: themePath,
      partialsDir: themePath
    })
  };
}

module.exports._defaults = _defaults;

module.exports.create = function (creationOpts) {
  const TemplateService = Object.assign(_defaults(), creationOpts);

  /**
   * 
   * @typedef {object} TemplateRootObject
   * @property {string} path Path to the template
   * @property {number} sourceId Souce themes id
   */


  /**
   * Register a template
   * @memberof TemplateService
   * @param {number} sourceThemeId Id of the source theme
   * @param {string} name Name/key for the template eg: index -> index.hbs
   * @param {string} path
   * @throws {Error}
   */
  function registerTemplate(sourceThemeId, name, path) {
    if (sourceThemeId == null) throw new ValidationError('sourceThemeId must be a number');
    if (typeof name !== 'string' || name === '') throw new ValidationError('name must be a string and not empty');
    if (typeof path !== 'string' || path === '') throw new ValidationError('path must be a string and not empty');
    let templatesRoot = TemplateService.templates.get(name);
    if (!templatesRoot) {
      templatesRoot = {
        active: {},
        _default: {}
      };
    }
    if (sourceThemeId === 0) {
      // 0 is the default theme
      templatesRoot._default = {
        path,
        sourceThemeId
      };
    }
    templatesRoot.active = {
      path,
      sourceThemeId
    };
    TemplateService.templates.set(name, templatesRoot);
    return Object.assign({}, templatesRoot);
  }
  TemplateService.registerTemplate = registerTemplate;

  
  /**
   * 
   * 
   * @param {string} name
   * @returns {templateRootObject}
   */
  function getTemplate(name) {
    const t = TemplateService.templates.get(name);
    if (!t) throw new Error(`Unable to find template of  + ${name}`);
    return t.active ? t.active : t._default;
  }
  TemplateService.getTemplate = getTemplate;

  /**
   * 
   * 
   * @param {res} res
   * @param {string} template
   * @param {object} options
   * @param {function(<Error|null>, html: string)} cb
   */
  function render(res, template, options, cb) {
    const opts = options || {};
    opts._locals = res.locals || {};
    opts.settings = {};
    const templateRootObject = TemplateService.getTemplate(template);
    TemplateService.hbsRender(templateRootObject.path, opts, function (err, html) {
      cb(err, html);
    });
  }
  TemplateService.render = render;

  
  /**
   * 
   * 
   * @param {req} req
   * @param {res} res
   * @param {next} next
   */
  function renderMiddleware(req, res, next) {
    res.trostRender = function (template, opts, cb) {
      return TemplateService.render(res, template, opts, function (err, html) {
        if (cb) return cb(err, html);
        if (err) return req.next(err);
        return res.send(html);
      });
    };
    next();
  }
  TemplateService.renderMiddleware = renderMiddleware;
  return TemplateService;
};
