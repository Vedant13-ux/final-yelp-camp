var express = require('express');
var router = express.Router();
var Campground = require('../models/campground');
var Comment = require('../models/comments');

var middleware = require('../middleware');
const campground = require('../models/campground');

router.post('/campgrounds/:id', middleware.isLoggedIn, function(req, res) {
    Campground.findById(req.params.id, function(err, campground) {
        if (err) {
            req.flash('error', err.message);
            res.redirect('back');
        } else {
            if (!campground) {
                req.flash('error', "Request Couldn't Be Completed");
                return res.redirect('back');
            }
            Comment.create(req.body.comment, function(err, newComment) {
                if (err) {
                    req.flash('error', "Request Coldn't Be Completed");
                    res.redirect('back');
                } else {
                    newComment.author = {
                        id: req.user.id,
                        username: req.user.username,
                        gender: req.user.gender
                    };
                    newComment.save();
                    campground.comments.push(newComment);
                    campground.save();
                    req.flash('success', 'Successfully Added Your Comment On The Campground');
                    res.redirect('/campgrounds/' + req.params.id);
                }
            });
        }
    });
});

router.put('/campgrounds/:id/:cmntid', middleware.checkUserCommentAuthorization, function(req, res) {
    Comment.findByIdAndUpdate(req.params.cmntid, req.body.comment, function(err) {
        if (err) {
            req.flash('error', "Request Couldn't Be Completed");
            res.redirect('back');
        } else {
            req.flash('success', 'Successfully Updated Your Comment On The Campground');
            res.redirect('/campgrounds/' + req.params.id);
        }
    });
});

router.delete('/campgrounds/:id/:cmntid', middleware.checkUserCommentAuthorization, function(req, res) {
    Comment.findByIdAndDelete(req.params.cmntid, function(err) {
        if (err) {
            req.flash('error', "Request Couldn't Be Completed");
            res.redirect('back');
        } else {
            req.flash('success', 'Successfully Deleted Your Comment On The Campground');
            res.redirect('/campgrounds/' + req.params.id);
        }
    });
});

module.exports = router;