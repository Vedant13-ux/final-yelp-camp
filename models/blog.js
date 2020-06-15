var mongoose = require('mongoose');
var blogSchema = new mongoose.Schema({
    title: String,
    campgroundName: String,
    location: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        username: String
    },
    image: String,
    body: String,
    created: { type: Date, default: Date.now },

});
module.exports = mongoose.model('Blog', blogSchema);