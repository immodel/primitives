var isEmpty = require('lodash.isempty');
var extend = require('lodash.assign');
var isArray = require('lodash.isarray');
var toArray = require('lodash.toarray');
var _ = require('lodash');

module.exports = function(model) {
  var base = model
    .validator(function(val) {
      return val instanceof ArrayDocument;
    }, 'array')
    .caster(toArray)
    .default([])
    .requiredValidator(function(value) {
      return value && value.length > 0;
    });
  
  base = createArray(base);

  var use = base.use;
  // Shim .use so we can pass down our array-ness to
  // our children
  base.use = function() {
    return createArray(use.apply(this, arguments));
  };
  
  base.on('init', function(evt) {
    refresh(evt.doc);
  });

  base.type('array', function(type) {
    return base.attr('*', type);
  });
};

function createArray(model) {
  var ArrayModel = function(arr) {
    arr = arr || [];
    var self = model.call(this, this);
    ArrayDocument.call(self, arr);
    return self;
  };
  ArrayModel.prototype = Object.create(ArrayDocument.prototype);
  extend(ArrayModel.prototype, model.prototype);
  extend(ArrayModel, model);
  return ArrayModel;  
}


function ArrayDocument(arr) {
  this.push.apply(this, arr);
}

ArrayDocument.prototype = Object.create(Array.prototype);

// We only care about the subset of array mutators
// that may add new items.  All we care about
// is ensuring that array elements have been coerced
// after being added, otherwise, we behave just like
// a normal array.
var mutators = ['push', 'splice', 'unshift'];

function refresh(arr) {
  // Getting each item in the array will cause
  // it to be wrapped in a model if it hasn't
  // already been.  If it has, then it will
  // be a noop (which is why we dont care about
  // the fact that we are almost always executing
  // this function many more times than necessary).
  arr.forEach(function(item, idx) {
    arr.get(idx.toString());
  });
}

mutators.forEach(function(method) {
  ArrayDocument.prototype[method] = function() {
    var res = Array.prototype[method].apply(this, arguments);
    refresh(this);
    return res;
  }
});