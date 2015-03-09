module.exports = function() {
  return this
    .validator(isNumber, 'number')
    .default(0)
    .caster(toNumber);

  function isNumber() {
    return 'number' === typeof this.value;
  }

  function toNumber(value) {
    return Number(value);
  }
};