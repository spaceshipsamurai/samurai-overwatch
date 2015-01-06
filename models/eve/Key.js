var mongoose = require('mongoose');
Character = require('./Character');

var Schema = mongoose.Schema;

var keySchema = mongoose.Schema({
    userId: { type: Schema.ObjectId },
    keyId: { type: Number, required: 'Key Id is required', unique: 'Key Id is already in use'},
    vCode: String,
    accessMask: Number,
    keyType: String,
    expires: Date,
    lastCheck: Date,
    status: { type: String, enum: ['Valid', 'Invalid']},
    validationErrors: [{ type: String }],
    error: [{ type: String }],
    characters: [{ type: Schema.ObjectId, ref: 'Character' }]
});

keySchema.pre('remove', function(next){

    var self = this;

    Character.remove({ key: self._id }).exec(function(err){
        if(err) console.log(err);
    });

    next();
});

var Key = mongoose.model('Key', keySchema);

module.exports = Key;