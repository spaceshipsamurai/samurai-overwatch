var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var characterSchema = mongoose.Schema({
    id: { type: Number, unique: true, required: true },
    name: String,
    user: { type: Schema.ObjectId, ref: 'User' },
    key: { type: Schema.ObjectId, ref: 'Key' },
    alliance: {
        id: Number,
        name: String
    },
    corporation: {
        id: Number,
        name: String
    }
});

var Character = mongoose.model('Character', characterSchema);

module.exports = Character;