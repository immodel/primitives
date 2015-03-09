var isEmpty = require('lodash.isempty');
var extend = require('lodash.assign');
var isArray = require('lodash.isarray');
var toArray = require('lodash.toarray');

module.exports = function() {
  var base = this
    .validator(function() {
      return this.value instanceof ArrayDocument;
    }, 'array')
    .caster(toArray)
    .default([])
    .requiredValidator(function() {
      return this.value && this.value.length > 0;
    });

  base = createArray(base);

  var use = base.use;
  // Shim .use so we can pass down our array-ness to
  // our children
  base.use = function() {
    return createArray(use.apply(this, arguments));
  };

  base.on('init', function(evt) {
    var doc = evt.doc;
    var model = doc.model;

    doc.forEach(function(item, idx) {
      var type = model.attr(idx.toString());
      doc[idx] = type.isDocument(item)
        ? item
        : new type(item);
    });
  });

  return function(type) {
    return base.attr('*', type);
  };
};

function createArray(model) {
  var ArrayModel = function(arr) {
    arr = arr || [];
    ArrayDocument.call(this, arr);
    return model.call(this, this);
  };
  ArrayModel.prototype = Object.create(ArrayDocument.prototype);
  // These do not need to be deep, because the model
  // passed in has already been cloned
  extend(ArrayModel.prototype, model.prototype);
  ArrayModel.prototype.model = ArrayModel;
  extend(ArrayModel, model);
  return ArrayModel;
}


function ArrayDocument(arr) {
  Array.prototype.push.apply(this, arr);
}

ArrayDocument.prototype = Object.create(Array.prototype);

var mutators = [
  'push',
  'splice',
  'unshift',
  'pop',
  'shift',
  'reverse',
  'sort'
];

function refresh(arr) {
  arr.forEach(function(item, idx) {
    arr.get(idx.toString());
  });
}

mutators.forEach(function(method) {
  ArrayDocument.prototype[method] = function() {
    var arr = this.slice();
    arr[method].apply(arr, arguments);
    return (new this.model(arr));
  }
});