const express = require('express');
const nunjucks = require('nunjucks');

const paths = require('./paths');
const website = require('./website');
const examples = require('./examples');
const logger = require('./logger');
const filters = require('./filters');
const keys = require('./keys');

exports.build = function(options) {
  options = options || {};

  const app = express();

  if (options.logLevel) 
    logger.level(options.logLevel);

  app.use(logger.middleware());
  app.use(express.compress());
  app.use(express.bodyParser());
  app.use(express.static(paths.staticDir));

  var loader = new nunjucks.FileSystemLoader(paths.viewsDir);
  var env = new nunjucks.Environment(loader, {
    autoescape: true
  });
  env.express(app);
  Object.keys(filters).forEach(function(name) {
    env.addFilter(name, filters[name]);
  });
  app.nunjucksEnv = env;

  app.get('/', website.index);
  app.post('/', website.validate);

  var host = examples.host;
  app.get('/oldassertion.valid.json', host(examples.validOldAssertion));
  app.get('/assertion.valid.json', host(examples.validAssertion));
  app.get('/badge.valid.json', host(examples.validBadge));
  app.get('/issuer.valid.json', host(examples.validIssuer));
  app.get('/signature.valid', host(examples.validSignature));
  app.get('/public-key', function(req, res, next){ res.send(keys.public) });

  return app;
};

