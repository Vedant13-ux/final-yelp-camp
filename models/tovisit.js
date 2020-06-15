var mongoose = require('mongoose');
var tovisitSchema = new mongoose.Schema({
    campentry: String
});

module.exports = mongoose.model('ToVisit', tovisitSchema);