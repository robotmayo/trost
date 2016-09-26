'use strict';
const http = require('http');

const express = require('express');
const session = require('express-session');
const bodyparser = require('body-parser');
const log = require('logbro');

const TemplateService = require('./services/template').create();
TemplateService.setActiveTheme('friend');

const App = express();
const server = http.createServer(App);
App.use(TemplateService.renderMiddleware);

App.get('/', function(req, res){
  res.trostRender('index', {});
});

server.listen(8000);
log.info('Listening on 8000');


