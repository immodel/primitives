require('../../')
  .validator(isString, 'string')
  .caster(toString)
  .default('')
  .type('string');

function isString(value) {
  return 'string' === typeof value;
}

function toString(value) {
  return value ? value.toString() : '';
}
