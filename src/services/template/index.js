const exhbs = require('express-hbs');
const log = require('logbro');

const themePath = require('path').join(__dirname, '../../theme');

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
  function registerTemplate(sourceThemeId, name, path) {
    if (sourceThemeId == null) throw new Error('SourceID cannont be null');
    if (name == null || name === '') throw new Error('name cannot be empty');
    if (path == null || path === '') throw new Error('path cannot be empty');
    let templatesRoot = TemplateService.templates.get(name);
    if (!templatesRoot) {
      templatesRoot = {
        active: {},
        _default: {}
      };
      TemplateService.templates.set(name, templatesRoot);
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
    log.info('Calling render');
    const templateRootObject = getTemplate(template);
    log.trace(templateRootObject);
    TemplateService._render(templateRootObject.path, opts, function (err, html) {
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
      return render(res, template, opts, function (err, html) {
        if (cb) return cb(err, html);
        if (err) return req.next(err);
        return res.send(html);
      });
    };
    next();
  }
  TemplateService.renderMiddleware = renderMiddleware;
};
