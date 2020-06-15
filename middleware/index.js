var Campground = require('../models/campground.js');
var Comment = require('../models/comments.js');
var Blog = require('../models/blog.js');
var middlewareObj = {};

middlewareObj.checkCampgroundOwnership = function(req, res, next) {
    if (req.isAuthenticated()) {
        Campground.findById(req.params.id, function(err, foundCampground) {
            if (err) {
                req.flash('error', 'Campground not found');
                res.redirect('/campgrounds');
            } else {
                if (!foundCampground) {
                    req.flash('error', 'Item not found.');
                    return res.redirect('/campgrounds');
                }

                if (foundCampground.author.id.equals(req.user._id)) {
                    next();
                } else {
                    req.flash('error', 'You dont have the permission to do that');
                    res.redirect('/campgrounds/' + foundCampground._id);
                }
            }
        });
    } else {
        req.flash('error', 'You need to be logged in to do that');
        res.redirect('back');
    }
};

middlewareObj.isLoggedIn = function(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash('error', 'You must be Logged in to do that');
    res.redirect('/login');
};

middlewareObj.checkUserCommentAuthorization = function(req, res, next) {
    if (req.isAuthenticated()) {
        Comment.findById(req.params.cmntid, function(err, comment) {
            if (err) {
                req.flash('error', 'Comment not found');
                res.redirect('/campgrgrounds/' + campground._id);
            } else {
                if (!comment) {
                    req.flash('errr', 'Item not found');
                    res.redirect('back');
                    return;
                }
                if (req.user._id.equals(comment.author.id)) {
                    next();
                } else {
                    req.flash('error', 'You dont have the permission to do that');
                }
            }
        });
    } else {
        req.flash('error', 'You must be Logged In to do that.');
    }
};

middlewareObj.checkBlogAuthorization = function(req, res, next) {
    if (req.isAuthenticated()) {
        Blog.findById(req.params.id, function(err, blog) {
            if (err) {
                req.flash('error', err.message);
                res.redirect('back');
            } else {
                if (!blog) {
                    req.flash('error', 'Blog Not Found');
                    return res.redirect('back');
                }
                if (req.user._id.equals(blog.author.id)) {
                    next();
                } else {
                    req.flash('error', 'You dont have the permission to do that');
                    res.redirect('/blogs/' + blog._id);
                }
            }
        });
    } else {
        req.flash('error', 'You must be Logged In to do that');
        res.redirect('/login');
    }
};

module.exports = middlewareObj;