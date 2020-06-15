var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');
var userSchema = new mongoose.Schema({
    username: String,
    password: String,
    toVisits: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ToVisit'
    }],
    gender: String
});
userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('User', userSchema);