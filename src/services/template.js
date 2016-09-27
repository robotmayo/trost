const exhbs = require('express-hbs');
const nconf = require('nconf');
const walk = require('walk');
const Promise = require('bluebird');
const log = require('logbro');
const resolvePath = require('path').resolve;

const cerr = require('../utils/cerr');
const capture = require('../utils/capture');
const fs = Promise.promisifyAll(require('fs'));
const HBS_EXT_REGEX = (/\.hbs$/);
const PARTIAL_FILE_REGEX = (/\.partial./);

const {
  ValidationError
} = cerr;

module.exports = function TemplateServiceCreate(tsOpts) {

  /**
   * 
   * @namespace TemplateService
   */

  const TemplateService = Object.assign(
    {
      cache: new Map(),
      templates: new Map(),
      themePath: nconf.get('theme_path'),
      hbsRender: exhbs.express4({
        layoutsDir: nconf.get('theme_path'),
        partialsDir: nconf.get('theme_path')
      })
    },
    tsOpts || {}
  );
  if(!TemplateService.themePath) throw new Error('[TemplateService] theme_path not set');


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
   * @param {string} themeName
   */
  function setActiveTheme(themeName) {
    return new Promise(function(resolve, reject){
      const walker = walk.walk(TemplateService.themePath, {followLinks: false});
      walker.on('file', function(root, fileStat, next){
        if(fileStat.name.match(HBS_EXT_REGEX) === null || fileStat.name.match(PARTIAL_FILE_REGEX) !== null) {
          return next();
        }
        const templateName = fileStat.name.split('.')[0];
        TemplateService.registerTemplate(themeName, templateName, resolvePath(root, fileStat.name));
      });
      walker.on('error', function(root, stats){
        // May return multiple errors but lets only reject on the first
        let statArr = stats;
        if(Array.isArray(statArr) === false) statArr = [statArr];
        statArr.forEach(node => log.error(`[TemplateService::setActiveTheme] ${node.err.message}`));
        reject(statArr[0].error);
      });
      walker.on('end', () => resolve());
    });
    
  }
  TemplateService.setActiveTheme = setActiveTheme;

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
    const capTemplateRootObject = capture(() => TemplateService.getTemplate(template));
    if (capTemplateRootObject.err) return cb(capTemplateRootObject.err);
    return void TemplateService.hbsRender(capTemplateRootObject.value.path, opts, function (err, html) {
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
