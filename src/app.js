const nconf = require('nconf');
nconf
  .env()
  .file(require('path').resolve(__dirname, '../config.json'));
const express = require('express');
const log = require('logbro');

const Server = require('./server');
let started = false;
const App = {};

/**
 * 
 * @returns
 */
function start() {
  if (started) return Promise.resolve();
  started = true;
  require('./db'); // Start the DB
  require('./services'); // Init services
  App.expressApp = express();
  Server(App.expressApp)
    .then(server => {
      App.server = server;
      server.listen(nconf.get('port'));
      log.info(`Listening on ${nconf.get('port')}`);
    })
    .catch(err => {
      log.error(`Start up failure ${err.stack}`);
    });
}
App._start = start;
module.exports = App;
if (require.main === module) start();
