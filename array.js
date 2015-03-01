var isEmpty = require('lodash.isempty');
var extend = require('lodash.assign');
var isArray = require('lodash.isarray');
var toArray = require('lodash.torray');
var model = require('../../');

module.exports = function(model) {
  var base = model
    .validator(isArray, 'array')
    .caster(toArray)
    .default([])
    .requiredValidator(function(value) {
      return value && value.length > 0;
    })
    .on('init', function(evt) {
      var rawDoc = evt.doc.doc === undefined || isEmpty(evt.doc.doc)
          ? []
          : evt.doc.doc;
      
      // Arrays are kind of intense, so who knows what might happen
      // if we let a non-array in here
      if(! isArray(rawDoc))
        throw new Error('Cannot construct non-array as array type');
      
      var doc = extend(rawDoc, arrayMixin, evt.doc);
      // This is self-referential, so that .get/.set
      // are properly
      doc.doc = doc;
      
      doc.forEach(function(item, idx) {
        doc.get(idx);
      });

      evt.doc = doc;
    })
    .type('array', function(type) {
      return base.attr('*', type);
    });
};


var arrayMixin = {};
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
  arrayMixin[method] = function() {
    var res = Array.prototype[method].apply(this, arguments);
    refresh(this);
    return res;
  }
})