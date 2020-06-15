var mongoose = require('mongoose');
var campSchema = new mongoose.Schema({
    name: String,
    image: String,
    imageId: String,
    description: String,
    views: Number,
    location: String,
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }],
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        username: String,
        gender: String
    },
    likes_count: {
        type: Number
    }
});
module.exports = mongoose.model('Campground', campSchema);