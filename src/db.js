const nconf = require('nconf');
const mysql = require('mysql');
const pool = mysql.createPool({
  user: nconf.get('DB:USER'),
  password: nconf.get('DB:PASSWORD'),
  host: nconf.get('DB:HOST'),
  port: nconf.get('DB:PORT'),
  database: nconf.get('DB:DATABASE')
});
module.exports = pool;
