module.exports = function(model) {
  return model
    .validator(isNumber)
    .caster(toNumber)
    .default(0);

  function isNumber(value) {
    return 'number' === typeof value;
  }

  function toNumber(value) {
    return Number(value);
  }  
};