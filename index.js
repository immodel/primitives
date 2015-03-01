module.exports = function(model) {
  require('./number')(model);
  require('./string')(model);
  require('./array')(model);
};