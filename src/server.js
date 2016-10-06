const http = require('http');
const Router = require('express').Router;
const bodyParser = require('body-parser');

module.exports = function (App) {
  const AuthRoutes = require('./routes/auth');
  const TemplateService = require('./services').TemplateService;
  return TemplateService
  .setActiveTheme('friend')
    .then(() => {
      const server = http.createServer(App);
      App.use(TemplateService.renderMiddleware);
      App.use(bodyParser.json());
      App.use(bodyParser.urlencoded({extended: true}));
      AuthRoutes.init(App);
      App.use(AuthRoutes.mountRoutes(Router()));

      App.get('/', function (req, res) {
        res.trostRender('index', {});
      });
      return server;
    });

};
