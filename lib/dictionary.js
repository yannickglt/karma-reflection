var dictionary = {};

function add(path, fn) {
  dictionary[path] = fn;
}

function get() {
  return dictionary;
}

function reset() {
  dictionary = {};
}

module.exports = {
  add: add,
  get: get,
  reset: reset
};
