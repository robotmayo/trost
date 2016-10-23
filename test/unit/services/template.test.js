import TemplateService from '../../../src/services/template';
import {ValidationError} from '../../../src/utils/cerr';

const noop = f => f;

it('creation', function(){
  const cache = new Map();
  const templates = new Map();
  const themePath = 'flavorTown';
  const hbsRender = f => f;
  const additional = {};
  const ourObj = {
    cache,
    templates,
    themePath,
    additional,
    hbsRender
  };
  const ts = TemplateService(ourObj);
  expect(cache).toBe(ts.cache);
  expect(templates).toBe(ts.templates);
  expect(themePath).toBe(ts.themePath);
  expect(hbsRender).toBe(ts.hbsRender);
  expect(additional).toBe(ts.additional);
  expect(ourObj).not.toBe(ts);
  expect(() => TemplateService()).toThrowError(Error);
});

it('registerTemplate', function(){
  const TS = TemplateService({themePath: 'path'});
  expect(() => TS.registerTemplate()).toThrowError(ValidationError);
  expect(() => TS.registerTemplate('default')).toThrowError(ValidationError);
  expect(() => TS.registerTemplate('default', '')).toThrowError(ValidationError);
  expect(() => TS.registerTemplate('default', 3)).toThrowError(ValidationError);
  expect(() => TS.registerTemplate('default', 'ff')).toThrowError(ValidationError);
  expect(() => TS.registerTemplate('default', 'ff', '')).toThrowError(ValidationError);
  expect(() => TS.registerTemplate('default', 'ff', 3)).toThrowError(ValidationError);

  const res = TS.registerTemplate('default', 'index', 'some/path');
  const templateRootObject = TS.templates.get('index');
  expect(res).toEqual(templateRootObject);
  expect(res._default.path).toBe('some/path');
  TS.registerTemplate('baller', 'index', 'some/path');
  const tro = TS.templates.get('index');
  expect(tro).toBe(templateRootObject);
  expect(tro.active).toEqual({path: 'some/path', sourceTheme: 'baller'});
});

it('getTemplate', function(){
  const TS = TemplateService({themePath: 'path'});
  TS.registerTemplate('default', 'index', 'path');
  const tmpl = TS.getTemplate('index');
  expect(tmpl).toEqual({sourceTheme: 'default', path: 'path'});
  expect(() => TS.getTemplate('flavorTown')).toThrowError(Error);
});

it('render', function(){
  const TS = TemplateService({
    themePath: 'path',
    hbsRender: function(path, opts, cb){
      expect(path).toBe('path');
      expect(opts.someData).toBe(-1);
      expect(opts.settings).toBeTruthy();
      expect(opts._locals).toBeTruthy();
      cb(null, true);
    }
  });
  TS.registerTemplate(0, 'index', 'path');
  TS.render({}, 'index', {someData: -1}, (err, v) => {
    expect(err).toBeFalsy();
    expect(v).toBeTruthy();
  });
});

it('renderMiddleware', function(){
  const TS = TemplateService({themePath: 'path'});
  const workingGT = () => {
    return {path: 'path'};
  };
  TS.getTemplate = workingGT;
  TS.hbsRender = function(path, opts, cb){
    cb(null, 'html');
  };
  const req = {
    next: function(err){
      expect(err).toBeTruthy();
    }
  };
  const res = {
    _locals: {},
    send: function(html){
      expect(html).toBe('html');
    }
  };
  TS.renderMiddleware(req, res, () => );
  res.trostRender('index', {}, function(err, str){
    expect(err).toBeFalsy();
    expect(str).toBe('html');
  });
  TS.getTemplate = () => {
    throw new Error();
  };
  TS.renderMiddleware(req, res, noop);
  res.trostRender('index', {}, function(err){
    expect(err).toBeTruthy();
  });
  TS.renderMiddleware(req, res, noop);
  res.trostRender('index', {});
  TS.getTemplate = workingGT;
  TS.renderMiddleware(req, res, noop);
  res.trostRender('index', {});
});

it('setActiveTemplate', function(done){
  const resolve = require('path').resolve;
  const TS = TemplateService({themePath: resolve(__dirname, 'theme')});
  return TS.setActiveTheme('testtheme')
  .then(() => {
    expect(TS.templates.size).toBe(3);
    expect(TS.getTemplate('index')).toEqual({
      path: resolve(__dirname, 'theme/testtheme/index.hbs'),
      sourceTheme: 'testtheme'
    });

    expect(TS.getTemplate('post')).toEqual({
      path: resolve(__dirname, 'theme/testtheme/post.hbs'),
      sourceTheme: 'testtheme'
    });

    expect(TS.getTemplate('c')).toEqual({
      path: resolve(__dirname, 'theme/testtheme/a/b/c.hbs'),
      sourceTheme: 'testtheme'
    });
    for(const tpl of TS.templates.values()){
      expect(Object.keys(tpl.active).length > 0).toBeTruthy();
      expect(Object.keys(tpl._default).length === 0).toBeTruthy();
    }
    
    
  })
  .catch(err => done.fail(err.stack));
});
