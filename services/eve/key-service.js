var bus = require('../shortbus'),
    debug = require('debug')('overwatch:key-service'),
    Key = require('mongoose').model('Key'),
    neow = require('neow'),
    moment = require('moment'),
    mongoose = require('mongoose');

var KeyService = function() {

    var validate = function(key) {

        var client = new neow.EveClient({ keyID: key.keyId, vCode: key.vCode});

        client.fetch('account:APIKeyInfo').then(function(result){

            var data = result.key;
            var errors = [];

            if(!validateAccessMask(data.accessMask)) errors.push("Invalid Access Mask");
            if(data.type !== 'Account') errors.push('Invalid Key Type');

            Character.find({ key: key._id }, function(err, characters){

                var existingIds = [];
                var validEntity = false;



                for(var x = 0; x < characters.length; x++)
                {
                    var fetched = data.characters[characters[x].id];
                    existingIds.push(characters[x].id);

                    if(!fetched)
                    {
                        characters[x].remove(function(err, c){
                            if(err) debug(err);
                            else {
                                bus.emit('character-removed', c);
                                debug('Character Removed: ' + c.name);
                            }
                        });
                    }
                    else {
                        var existing = characters[x];
                        var changed = false;

                        if(existing.corporation.id != fetched.corporationID)
                        {
                            changed = true;
                            existing.corporation.id = fetched.corporationID;
                            existing.corporation.name = fetched.corporationName;
                        }

                        if(existing.alliance.id != fetched.allianceID)
                        {
                            changed = true;
                            existing.corporation.id = fetched.allianceID;
                            existing.corporation.name = fetched.allianceName;
                        }

                        if(validateAlliance(fetched.allianceID) || validateCorporation(fetched.corporationID))
                        {
                            validEntity = true;
                        }

                        if(changed)
                        {
                            existing.save(function(err, updatedCharacter){
                                debug('Character Changed: ' + updatedCharacter.name);
                                bus.emit('character-changed', updatedCharacter);
                            });
                        }
                        else {
                            debug('No changes found for ' + existing.name);
                        }

                    }
                }

                for(var c in data.characters)
                {
                    if(existingIds.indexOf(Number(c)) === -1)
                    {
                        debug('[' + key._id +']New Character: ' + c);

                        //new character
                        var character = data.characters[c];
                        var characterModel = new Character({
                            _id: mongoose.Types.ObjectId(),
                            name: character.characterName,
                            user: key.userId,
                            key: key._id,
                            corporation: {
                                id: character.corporationID,
                                name: character.corporationName
                            },
                            alliance: {
                                id: character.allianceID,
                                name: character.allianceName
                            },
                            id: character.characterID
                        });

                        if(validateAlliance(character.allianceID) || validateCorporation(character.corporationID))
                        {
                            validEntity = true;
                        }

                        characterModel.save();
                        key.characters.push(characterModel._id);
                    }
                }

                if(!validEntity) errors.push('No friendly characters');


                if(errors.length > 0)
                {
                    key.status = 'Invalid';
                    key.validationErrors = errors;
                    debug('Validation Errors: ' + errors);
                }

                key.lastCheck = new Date();
                key.save(function(err, key){
                    if(err) debug('ERROR: ' + err);
                    debug('Validated Key: ' + key._id);
                });

            });

        }).catch(function(error){
            key.status = 'Invalid';
            key.validationErrors = ['Processing Error, see IT'];
            key.error = [error];
            key.save(function(err, key){
                if(err) debug(err);
                else debug('Error processing: ' + key._id);
            })
        });

    };

    var validateAccessMask = function(given) {

        var access = given | 1; //account balance
        access = access | 4096; //market orders
        access = access | 4194304; //Wallet Transactions

        return access === 268435455;
    };

    var validateAlliance = function(id) {
        id = Number(id);
        var valid = [99001904];
        return valid.indexOf(id) > -1;
    };

    var validateCorporation = function(id) {
        id = Number(id);
        var valid = [];
        return valid.indexOf(id) > -1;
    };

    var validateBatch = function(count) {

        Key.find({ status: 'Valid' })
            .sort({ lastCheck: 'desc' })
            .limit(count)
            .exec(function(err, docs){

                for(var x = 0; x < docs.length; x++)
                {
                    var end = moment();
                    var start = moment(docs[x].lastCheck);
                    var hours = end.diff(start, 'seconds');

                    if(hours >= 1)
                    {
                        validate(docs[x]);
                    }

                }

            });

    };

    return {
        validate: validate,
        validateBatch: validateBatch
    }

}();

module.exports = KeyService;
