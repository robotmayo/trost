'use strict';
const http = require('http');
const nconf = require('nconf');

const express = require('express');
const Router = express.Router;
const session = require('express-session');
const bodyparser = require('body-parser');
const log = require('logbro');

nconf.argv().env().file(require('path').resolve(__dirname, '../config.json'));

const AuthRoutes = require('./routes/auth');
const TemplateService = require('./services').TemplateService;
TemplateService.setActiveTheme('friend');

const App = express();
const server = http.createServer(App);
App.use(TemplateService.renderMiddleware);
AuthRoutes.init(App);
App.use(AuthRoutes.mountRoutes(Router()));

App.get('/', function(req, res){
  res.trostRender('index', {});
});

server.listen(8000);
log.info('Listening on 8000');


