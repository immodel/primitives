module.exports = function(model) {  
  model
    .type('string', require('./string'))
    .type('number', require('./number'))
    .type('array', require('./array'));
};