var reflection = require('reflection-instrumenter');

function ReflectionFramework (files) {
  files.unshift(createPattern(reflection.adapter()));
  files.unshift(createPattern(reflection.framework()));
}

function createPattern (path) {
  return {
    pattern: path,
    included: true,
    served: true,
    watched: false
  };
}

ReflectionFramework.$inject = ['config.files'];

module.exports = ReflectionFramework;
