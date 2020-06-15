var express = require('express');
var router = express.Router();
var Blog = require('../models/blog.js');
var middleware = require('../middleware');

router.get('/blogs', function(req, res) {
    Blog.find({}, function(err, blogs) {
        if (err) {
            console.log('Something Went Wrong!');
            console.log(err);
        } else {
            res.render('blog/blogs', { blogs: blogs });
        }
    });
});

router.get('/blogs/new', middleware.isLoggedIn, function(req, res) {
    res.render('blog/new');
});

router.post('/blogs', function(req, res) {
    console.log(req.body.blog.body);
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.create(req.body.blog, function(err, blog) {
        if (err) {
            req.flash('error', "Request Couldn't Be Completed");
            res.redirect('/blogs');
        } else {
            blog.author = {
                id: req.user.id,
                username: req.user.username
            };
            blog.save();
            req.flash('success', 'Successfully Added Your Blog');
            res.redirect('/blogs/' + blog._id);
        }
    });
});

router.get('/blogs/:id', middleware.isLoggedIn, function(req, res) {
    Blog.findById(req.params.id, function(err, foundBlog) {
        if (err) {
            req.flash('error', 'Blog Not Found');
            res.redirect('/blogs');
        } else {
            if (!foundBlog) {
                req.flash('error', 'Blog Not Found');
                return res.redirect('back');
            }
            res.render('blog/show', { blog: foundBlog });
        }
    });
});

router.get('/blogs/:id/edit', middleware.checkBlogAuthorization, function(req, res) {
    Blog.findById(req.params.id, function(err, foundBlog) {
        if (err) {
            res.redirect('/blogs/:id');
        } else {
            if (!foundBlog) {
                req.flash('error', 'Item Not Found');
                return res.redirect('back');
            }
            res.render('blog/edit', { blog: foundBlog });
        }
    });
});

router.put('/blogs/:id', middleware.checkBlogAuthorization, function(req, res) {
    req.body.blog.body = req.sanitize(req.body.blog.body);
    console.log(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog) {
        if (err) {
            req.flash('error', "Request Couldn't be Completed");
            res.redirect('/blogs');
        } else {
            if (!updatedBlog) {
                req.flash('error', "Request Couldn't Be Completed");
                return res.redirect('back');
            }
            res.redirect('/blogs/' + req.params.id);
        }
    });
});
router.delete('/blogs/:id', middleware.checkBlogAuthorization, function(req, res) {
    Blog.findByIdAndRemove(req.params.id, function(err) {
        if (err) {
            req.flash('error', "Request Couldn't be Completed");
            res.redirect('/blogs');
        } else {
            res.redirect('/blogs');
        }
    });
});

module.exports = router;