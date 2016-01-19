var _ = require('lodash');
var crypto = require('crypto');
var tempWrite = require('temp-write');

function ReflectionFramework (files) {

  var trackerVar = ReflectionFramework.getTrackerVar();

  var template = 'var Reflection = { get: function (path) { return <%= trackerVar %>.__reflection[path]; } };' +
    'var <%= trackerVar %> = function (d) { for (var k in d) { <%= trackerVar %>.__reflection[k] = d[k]; } };' +
    '<%= trackerVar %>.__reflection = {};';
  var compiledTemplate = _.template(template)({ trackerVar: trackerVar });
  var fileName = tempWrite.sync(compiledTemplate, 'reflection.js');
  files.unshift(createPattern(fileName));
}

ReflectionFramework.getTrackerVar = function () {
  if (!ReflectionFramework.trackerVar) {
    var hash = crypto.createHash('md5');
    var suffix = hash.digest('base64');
    suffix = suffix.replace(/=/g, '').replace(/\+/g, '_').replace(/\//g, '$');
    ReflectionFramework.trackerVar = '__reflect_' + suffix;
  }
  return ReflectionFramework.trackerVar;
};

function createPattern (path) {
  return {
    pattern: path,
    included: true,
    served: true,
    watched: false
  }
}

ReflectionFramework.$inject = ['config.files'];

module.exports = ReflectionFramework;
