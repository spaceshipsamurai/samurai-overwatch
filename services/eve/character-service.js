var bus = require('../shortbus'),
    debug = require('debug')('overwatch:character-service');

var CharacterService = function(){

    var validate = function(id) {

    };

    return {
        validate: validate
    }

}();

bus.on('key-validated', function(){
    debug('received validated key');
});

module.exports = CharacterService;
