module.exports = function() {
  return this
    .validator(isString, 'string')
    .caster(toString)
    .default('');

  function isString() {
    return 'string' === typeof this.value;
  }

  function toString(value) {
    return value
      ? value.toString()
      : '';
  }
};