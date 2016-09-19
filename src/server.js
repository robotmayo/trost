'use strict';
const http = require('http');

const express = require('express');
const session = require('express-session');
const bodyparser = require('body-parser');
const log = require('logbro');

const App = express();
const server = http.createServer(App);

App.get('/', function(req, res){
  res.json({test : true});
});

server.listen(8000);
log.info('Listening on 8000');


