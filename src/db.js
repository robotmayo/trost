const nconf = require('nconf');

module.exports = require('mysql').createPool(nconf.get('database'));
