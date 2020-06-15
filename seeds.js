var express = require('express');
var router = express.Router();
var Campground = require('./models/campground');
var Blog = require('./models/blog');

function seedDB() {
    Campground.deleteMany({}, function(err) {
        if (err) {
            console.log(err);
        } else {
            console.log('Removed');
        }
    });
    Blog.deleteMany({}, function(err) {
        if (err) {
            console.log(err);
        } else {
            console.log('Removed Blogs');
        }
    });
}
module.exports = seedDB;