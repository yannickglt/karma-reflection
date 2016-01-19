var path = require('path');
var _ = require('lodash');
var stringify = require('node-stringify');
var Reflection = require('./reflection');
var ReflectionFramework = require('./framework');

var ReflectionPreprocessor = function (logger, helper, basePath) {
  var _ = helper._;
  var log = logger.create('preprocessor.reflection');

  var trackerVar = ReflectionFramework.getTrackerVar();

  return function (content, file, done) {
    log.debug('Processing "%s".', file.originalPath);

    var filePath = getPath(file.originalPath.replace(basePath + '/', ''));

    var reflectedFile = new Reflection(content);
    var functionsByPath = extractFunctions(reflectedFile, filePath);

    var template = '\nif (<%= trackerVar %>) { <%= trackerVar %>(<%= functionsByPath %>); }';

    content += _.template(template)({
      trackerVar: trackerVar,
      functionsByPath: stringify(functionsByPath)
    });

    done(content);
  };
};

function extractFunctions (scope, parentPath) {
  var res = {};
  _.forEach(scope.functions, function (fn) {
    var fnPath = parentPath + '.' + fn.name;
    res[fnPath] = fn.getClosure();
    _.assign(res, extractFunctions(fn, fnPath));
  });
  return res;
}

/**
 * Returns the path as dot separated
 * @param filePath
 * @returns {string}
 */
function getPath (filePath) {
  var pathParts = path.parse(filePath);
  var returnPath = pathParts.dir.replace('.', '_').split(path.sep);
  returnPath.push(pathParts.name.replace('.', '_'));
  return returnPath.join('.');
}

ReflectionPreprocessor.$inject = ['logger', 'helper', 'config.basePath'];

module.exports = ReflectionPreprocessor;
