var _ = require('lodash');
var tempWrite = require('temp-write');
var path = require('path');
var reflection = require('./reflection');

function ReflectionFramework (files) {
  var trackerVar = reflection.getTrackerVar();

  var template = 'var <%= trackerVar %> = function (p,c) { Reflection.__files[p] = c; };';
  var compiledTemplate = _.template(template)({ trackerVar: trackerVar });
  var fileName = tempWrite.sync(compiledTemplate, 'reflection-tracker.js');

  files.unshift(createPattern(fileName));
  files.unshift(createPattern(path.resolve(__dirname, '../node_modules/reflectionjs/dist/reflection.js')));
}

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
