const nconf = require('nconf');
nconf.env('__').argv().file({file: './test-config.json'});
const mysql = require('mysql');
const query = require('./src/utils/query');
const schema = require('fs').readFileSync('./src/database/schema.sql', 'utf-8');


function setup() {
  const nodb = mysql.createConnection({
    user: nconf.get('database:user'),
    password: nconf.get('database:password'),
    port: nconf.get('database:port'),
    host: nconf.get('database:host'),
    multipleStatements: true
  });
  const db = mysql.createConnection({
    user: nconf.get('database:user'),
    password: nconf.get('database:password'),
    port: nconf.get('database:port'),
    host: nconf.get('database:host'),
    database: 'trost_test',
    multipleStatements: true
  });
  return query(nodb, 'DROP DATABASE IF EXISTS `trost_test`; CREATE DATABASE `trost_test`;')
    .then(() => {
      return query(db, schema);
    })
    .then(() => {
      db.end();
      nodb.end();
    })
    .catch(err => {
      nodb.end();
      db.end();
      throw err;
    });

}

// Well it uses a special dev table so this shouldnt matter buttttttttttttttttttttttt
if (nconf.get('NODE_ENV') === 'PRODUCTION') throw new Error('Do not run in a production environments');
else setup();
