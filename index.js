module.exports = function() {  
  this
    .type('string', require('./string'))
    .type('number', require('./number'))
    .type('array', require('./array'));
};