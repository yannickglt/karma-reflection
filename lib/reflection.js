var _ = require('lodash');
var esprima = require('esprima');
var crypto = require('crypto');

var _TEMPLATE = "<%= content %>\nif(<%= trackerVar %>){<%= trackerVar %>('<%= filePath %>',<%= syntaxTree %>);}";
var _trackerVar;

function instrument(content, filePath) {

  var syntaxTree = esprima.parse(String(content), {
    loc: true
  });

  return _.template(_TEMPLATE)({
    content: content,
    trackerVar: getTrackerVar(),
    syntaxTree: JSON.stringify(syntaxTree), // @todo replace with JSON.stringify
    filePath: filePath
  });
}

function getTrackerVar() {
  if (!_trackerVar) {
    var hash = crypto.createHash('md5');
    var suffix = hash.digest('base64');
    suffix = suffix.replace(/=/g, '').replace(/\+/g, '_').replace(/\//g, '$');
    _trackerVar = '__reflect_' + suffix;
  }
  return _trackerVar;
}

module.exports = {
  instrument: instrument,
  getTrackerVar: getTrackerVar
};
