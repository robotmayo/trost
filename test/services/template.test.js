import test from 'ava';
import TemplateService from '../../src/services/template';
import {ValidationError} from '../../src/utils/cerr';

const noop = f => f;

test('creation', function(t){
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
  t.is(cache, ts.cache);
  t.is(templates, ts.templates);
  t.is(themePath, ts.themePath);
  t.is(hbsRender, ts.hbsRender);
  t.is(additional, ts.additional);
  t.not(ourObj, ts);
  t.throws(() => TemplateService(), Error);
});

test('registerTemplate', function(t){
  const TS = TemplateService({themePath: 'path'});
  t.throws(() => TS.registerTemplate(), ValidationError);
  t.throws(() => TS.registerTemplate('default'), ValidationError);
  t.throws(() => TS.registerTemplate('default', ''), ValidationError);
  t.throws(() => TS.registerTemplate('default', 3), ValidationError);
  t.throws(() => TS.registerTemplate('default', 'ff'), ValidationError);
  t.throws(() => TS.registerTemplate('default', 'ff', ''), ValidationError);
  t.throws(() => TS.registerTemplate('default', 'ff', 3), ValidationError);

  const res = TS.registerTemplate('default', 'index', 'some/path');
  const templateRootObject = TS.templates.get('index');
  t.deepEqual(res, templateRootObject);
  t.is(res._default.path, 'some/path', 'Id of default should always be default');
  TS.registerTemplate('baller', 'index', 'some/path');
  const tro = TS.templates.get('index');
  t.is(tro, templateRootObject, 'Should alter the index object not replace it');
  t.deepEqual(tro.active, {path: 'some/path', sourceTheme: 'baller'});
});

test('getTemplate', function(t){
  const TS = TemplateService({themePath: 'path'});
  TS.registerTemplate('default', 'index', 'path');
  const tmpl = TS.getTemplate('index');
  t.deepEqual(tmpl, {sourceTheme: 'default', path: 'path'});
  t.throws(() => TS.getTemplate('flavorTown'), Error);
});

test('render', function(t){
  const TS = TemplateService({
    themePath: 'path',
    hbsRender: function(path, opts, cb){
      t.is(path, 'path');
      t.is(opts.someData, -1);
      t.truthy(opts.settings);
      t.truthy(opts._locals);
      cb(null, true);
    }
  });
  TS.registerTemplate(0, 'index', 'path');
  TS.render({}, 'index', {someData: -1}, (err, v) => {
    t.falsy(err);
    t.truthy(v, 'render callback called');
  });
});

test('renderMiddleware', function(t){
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
      t.truthy(err);
    }
  };
  const res = {
    _locals: {},
    send: function(html){
      t.is(html, 'html');
    }
  };
  TS.renderMiddleware(req, res, () => t.pass('Next is called'));
  res.trostRender('index', {}, function(err, str){
    t.falsy(err);
    t.is(str, 'html');
  });
  TS.getTemplate = () => {
    throw new Error();
  };
  TS.renderMiddleware(req, res, noop);
  res.trostRender('index', {}, function(err){
    t.truthy(err);
  });
  TS.renderMiddleware(req, res, noop);
  res.trostRender('index', {});
  TS.getTemplate = workingGT;
  TS.renderMiddleware(req, res, noop);
  res.trostRender('index', {});
});

test('setActiveTemplate', function(t){
  const resolve = require('path').resolve;
  const TS = TemplateService({themePath: resolve(__dirname, 'theme')});
  return TS.setActiveTheme('testtheme')
  .then(() => {
    t.is(TS.templates.size, 3);
    t.deepEqual(
      TS.getTemplate('index'),
      {
        path: resolve(__dirname, 'theme/testtheme/index.hbs'),
        sourceTheme: 'testtheme'
      }
    );

    t.deepEqual(
      TS.getTemplate('post'),
      {
        path: resolve(__dirname, 'theme/testtheme/post.hbs'),
        sourceTheme: 'testtheme'
      }
    );

    t.deepEqual(
      TS.getTemplate('c'),
      {
        path: resolve(__dirname, 'theme/testtheme/a/b/c.hbs'),
        sourceTheme: 'testtheme'
      }
    );
    for(const tpl of TS.templates.values()){
      t.truthy(Object.keys(tpl.active).length > 0);
      t.truthy(Object.keys(tpl._default).length === 0);
    }
    
    
  })
  .catch(err => t.fail(err.stack));
});
