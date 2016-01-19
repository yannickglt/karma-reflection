var _ = require('lodash');
var vm = require('vm');
var util = require('util');
var esprima = require('esprima');
var escodegen = require('escodegen');
var JSONSelect = require('JSONSelect');

function Reflection (file) {
  this.astNode = esprima.parse(String(file), {
    loc: true
  });

  this.functions = getPrivateFunctions(this.astNode);
}

function getPrivateFunctions (block) {
  var functions = {};
  if (block) {
    _.forEach(block.body, function (node) {

      // for: var doSomething = function ()
      if ((node.type === 'VariableDeclaration') &&
        (_.get(node, 'declarations.length') === 1) &&
        (_.get(node, 'declarations.0.type') === 'VariableDeclarator') &&
        (_.get(node, 'declarations.0.init.type') === 'FunctionExpression')) {

        var variableName = _.get(node, 'declarations.0.id.name');
        if (!_.isNull(variableName) && !_.startsWithUpperCase(variableName)) {
          functions[variableName] = new ReflectionFunction(variableName, node);
        }

        // Named function expression
        var namedFunction = _.get(node, 'declarations.0.init.id');
        if (!_.isNull(namedFunction) && !_.startsWithUpperCase(namedFunction.name)) {
          functions[namedFunction.name] = new ReflectionFunction(namedFunction.name, node);
        }
      }
      // for: function doSomething ()
      else if (node.type === 'FunctionDeclaration') {
        functions[node.id.name] = new ReflectionFunction(node.id.name, node);
      }
    });
  }
  return functions;
}

function getFunctionExpressions (block) {
  var functions = {};
  if (block) {
    _.forEach(block.body, function (node) {
      // :root > :has(.type:val("VariableDeclaration"), .declarations > :has(.init .type:val("FunctionExpression")))
      // for: var doSomething = function ()
      if ((node.type === 'VariableDeclaration') &&
        (_.get(node, 'declarations.length') === 1) &&
        (_.get(node, 'declarations.0.type') === 'VariableDeclarator') &&
        (_.get(node, 'declarations.0.init.type') === 'FunctionExpression')) {

        var variableName = _.get(node, 'declarations.0.id.name');
        if (!_.isNull(variableName) && !_.startsWithUpperCase(variableName)) {
          functions[variableName] = new ReflectionFunction(variableName, node);
        }

        // Named function expression
        var namedFunction = _.get(node, 'declarations.0.init.id');
        if (!_.isNull(namedFunction) && !_.startsWithUpperCase(namedFunction.name)) {
          functions[namedFunction.name] = new ReflectionFunction(namedFunction.name, node);
        }
      }
    });
  }
  return functions;
}

function getBody (node) {
  if (node.type === 'Program') {
    return _.get(node, 'body.0.body');
  }
  else if (node.type === 'VariableDeclaration') {
    return _.get(node, 'declarations.0.init.body');
  }
  else if (node.type === 'FunctionDeclaration') {
    return _.get(node, 'body');
  }
}

function ReflectionFunction (name, astNode) {
  this.name = name;
  this.astNode = astNode;
  this.body = getBody(astNode);
  this.functions = {
    declarations: {},
    expressions: getFunctionExpressions(this.body)
  };
}
/**
 * @todo try something like: return Function(funcAsString); which should be less expensive
 * @returns {*}
 */
ReflectionFunction.prototype.getClosure = function () {
  var funcAsString = this.toString();
  var sandbox = {res: null};
  vm.createContext(sandbox);
  vm.runInContext('res = ' + funcAsString, sandbox);
  return _.get(sandbox, 'res');
};

ReflectionFunction.prototype.toString = function () {
  var funcBody;
  try {
    funcBody = escodegen.generate(this.body);
  } catch (e) {
    funcBody = '{}';
  }
  return 'function ' + this.name + ' ()' + funcBody + ';';
};

ReflectionFunction.prototype.invoke = function (obj) {
  var closure = this.getClosure();
  return closure.apply(obj, _.rest(arguments));
};

_.mixin({
  'startsWithUpperCase': function (str) {
    if (!_.isString(str)) {
      return false;
    } else {
      return /^[A-Z]/.test(str);
    }
  },
  'clear': function (obj) {
    if (_.isArray(obj)) {
      obj.splice(0, obj.length);
    } else if (_.isObject(obj)) {
      for (var i in obj) {
        if (obj.hasOwnProperty(i)) {
          delete obj[i];
        }
      }
    }
  }
});

module.exports = Reflection;
