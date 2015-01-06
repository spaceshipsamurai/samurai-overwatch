module.exports = function(app) {
  app.use('/api/keys', require('./eve/key-routes'));
};