var path = require('path');
var reflection = require('./reflection');

var ReflectionPreprocessor = function (logger, helper, basePath) {
  var log = logger.create('preprocessor.reflection');

  return function (content, file, done) {
    log.debug('Processing "%s".', file.originalPath);

    var filePath = getPath(file.originalPath.replace(basePath + '/', ''));
    var reflectedContent = reflection.instrument(content, filePath);
    done(reflectedContent);
  };
};

/**
 * Returns the path as dot separated
 * @param filePath
 * @returns {string}
 */
function getPath (filePath) {
  var pathParts = path.parse(filePath);
  var returnPath = pathParts.dir.replace('.', '_').split(path.sep);
  returnPath.push(pathParts.name.replace('.', '_'));
  return returnPath.join('/');
}

ReflectionPreprocessor.$inject = ['logger', 'helper', 'config.basePath'];

module.exports = ReflectionPreprocessor;
