module.exports = function(model) {
  model.use(require('./number'));
  model.use(require('./string'));
  model.use(require('./array'));
};