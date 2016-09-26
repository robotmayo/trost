import test from 'ava';
import TemplateService from '../../src/services/template';
import {ValidationError} from '../../src/utils/cerr';

const noop = f => f;

test('create', function(t){
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
  const ts = TemplateService.create(ourObj);
  t.is(cache, ts.cache);
  t.is(templates, ts.templates);
  t.is(themePath, ts.themePath);
  t.is(hbsRender, ts.hbsRender);
  t.is(additional, ts.additional);
  t.not(ourObj, ts);
});

test('registerTemplate', function(t){
  const TS = TemplateService.create();
  t.throws(() => TS.registerTemplate(), ValidationError);
  t.throws(() => TS.registerTemplate(0), ValidationError);
  t.throws(() => TS.registerTemplate(0, ''), ValidationError);
  t.throws(() => TS.registerTemplate(0, 3), ValidationError);
  t.throws(() => TS.registerTemplate(0, 'ff'), ValidationError);
  t.throws(() => TS.registerTemplate(0, 'ff', ''), ValidationError);
  t.throws(() => TS.registerTemplate(0, 'ff', 3), ValidationError);

  const res = TS.registerTemplate(0, 'index', 'some/path');
  const templateRootObject = TS.templates.get('index');
  t.deepEqual(res, templateRootObject);
  t.is(res._default.path, 'some/path', 'Id of 0 should always be default');
  TS.registerTemplate(1, 'index', 'some/path');
  const tro = TS.templates.get('index');
  t.is(tro, templateRootObject, 'Should alter the index object not replace it');
  t.deepEqual(tro.active, {path: 'some/path', sourceThemeId: 1});
});

test('getTemplate', function(t){
  const TS = TemplateService.create();
  TS.registerTemplate(0, 'index', 'path');
  const tmpl = TS.getTemplate('index');
  t.deepEqual(tmpl, {sourceThemeId: 0, path: 'path'});
  t.throws(() => TS.getTemplate('flavorTown'), Error);
});

test('render', function(t){
  const TS = TemplateService.create({
    hbsRender: function(path, opts, cb){
      t.is(path, 'path');
      t.is(opts.someData, -1);
      t.truthy(opts.settings);
      t.truthy(opts._locals);
      cb(null, true)
    }
  });
  TS.registerTemplate(0, 'index', 'path');
  TS.render({}, 'index', {someData: -1}, (err, v) => {
    t.falsy(err);
    t.truthy(v, 'render callback called');
  });
});

test('renderMiddleware', function(t){
  const TS = TemplateService.create();
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
    _locals : {},
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
