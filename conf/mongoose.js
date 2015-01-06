var mongoose = require('mongoose'),
    config = require('./config'),
    debug = require('debug')('overwatch:mongo');



mongoose.connect(config.mongodb);
var db = mongoose.connection;

db.on('error', function(err){
    debug(err);
});

db.once('open', function(){
    debug('Connection Open');
});


require('../models');

module.exports = mongoose;


