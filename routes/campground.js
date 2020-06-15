var express = require('express');
var router = express.Router();

var Campground = require('../models/campground');
var Blog = require('../models/blog');
var Comment = require('../models/comments');
var middleware = require('../middleware');
var multer = require('multer');
var storage = multer.diskStorage({
    filename: function(req, file, callback) {
        callback(null, Date.now() + file.originalname);
    }
});
var imageFilter = function(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter });

var cloudinary = require('cloudinary');
const { checkCampgroundOwnership } = require('../middleware');
cloudinary.config({
    cloud_name: 'ved13',
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
router.get('/campgrounds', function(req, res) {
    var noMatch = null;
    if (req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        Campground.find({ $or: [{ location: regex }, { name: regex }] }, function(err, allCampgrounds) {
            if (err) {
                console.log(err);
            } else {
                if (allCampgrounds.length < 1) {
                    noMatch = 'No campgrounds match that query, please try again.';
                    Campground.find({}, function(err, campgrounds) {
                        if (err) {
                            console.log(err);
                        } else {
                            res.render('campground/campgrounds', { campGrounds: campgrounds, noMatch: noMatch });
                        }
                    });
                } else {
                    res.render('campground/campgrounds', { campGrounds: allCampgrounds, noMatch: noMatch });
                }
            }
        });
    } else {
        Campground.find({}, function(err, allCampgrounds) {
            if (err) {
                console.log(err);
            } else {
                res.render('campground/campgrounds', { campGrounds: allCampgrounds, noMatch: noMatch });
            }
        });
    }
});

router.get('/campgrounds/new', middleware.isLoggedIn, function(req, res) {
    res.render('campground/new');
});

router.post('/campgrounds', middleware.isLoggedIn, upload.single('image'), function(req, res) {
    cloudinary.v2.uploader.upload(req.file.path, function(err, result) {
        if (err) {
            req.flash('error', err.message);
            return res.redirect('back');
        }

        req.body.campground.image = result.secure_url;
        req.body.campground.imageId = result.public_id;
        req.body.campground.author = {
            id: req.user._id,
            username: req.user.username,
            gender: req.user.gender
        };
        Campground.create(req.body.campground, function(err, campground) {
            if (err) {
                req.flash('error', err.message);
                return res.redirect('back');
            }
            res.redirect('/campgrounds/' + campground._id);
        });
    });
});

// router.post('/campgrounds/:id/like', (req, res, next) => {
//     var action = req.body.action;
//     var counter;
//     if (action === 'Like') {
//         counter = 1;
//         isLiked = true;
//     } else {
//         counter = -1;
//         isLiked = false;
//     }
//     Campground.updateOne({ _id: req.params.id }, { $inc: { likes_count: counter } }, { isLiked: isLiked },
//         (err, numberAffected) => {
//             res.send('');
//         }
//     );
// });

router.get('/campgrounds/:id', middleware.isLoggedIn, function(req, res) {
    Campground.findById(req.params.id).populate('comments').exec(function(err, campground) {
        if (err) {
            req.flash('error', 'Campground Not Found');
            res.redirect('/campgrounds');
        } else {
            if (!campground) {
                req.flash('error', 'Campground Not Found');
                return res.redirect('/campgrounds');
            }
            Blog.find({ campgroundName: new RegExp(escapeRegex(campground.name), 'gi') }, function(err, blogs) {
                if (err) {
                    req.flash('error', err.message);
                    return res.redirect('back');
                } else {
                    res.render('campground/showCampground', { campground: campground, blogs: blogs });
                }
            });
        }
    });
});

router.get('/campgrounds/:id/edit', middleware.checkCampgroundOwnership, function(req, res) {
    Campground.findById(req.params.id, function(err, campground) {
        if (err) {
            req.flash('error', err.message);
            res.redirect('/campgrounds/' + campground._id);
        } else {
            if (!campground) {
                req.flash('error', 'Item Not Found');
                return res.redirect('back');
            }
            res.render('campground/edit', { campground: campground });
        }
    });
});

router.put('/campgrounds/:id', middleware.checkCampgroundOwnership, upload.single('image'), function(req, res) {
    Campground.findById(req.params.id, async function(err, foundcampground) {
        if (req.file) {
            try {
                await cloudinary.v2.uploader.destroy(foundcampground.imageId);
                var result = await cloudinary.v2.uploader.upload(req.file.path);
                foundcampground.imageId = result.public_id;
                foundcampground.image = result.secure_url;
            } catch (err) {
                req.flash('error', err.message);
                return res.redirect('back');
            }
        }
        foundcampground.name = req.body.campground.name;
        foundcampground.description = req.body.campground.description;
        foundcampground.location = req.body.campground.location;
        foundcampground.save();
        req.flash('success', 'Successfully Updated Your Campground');
        res.redirect('/campgrounds/' + foundcampground._id);
    });
});

router.delete('/campgrounds/:id', middleware.checkCampgroundOwnership, function(req, res) {
    Campground.findById(req.params.id, async function(err, campground) {
        if (err) {
            req.flash('error', err.message);
            return res.redirect('back');
        }
        try {
            await cloudinary.v2.uploader.destroy(campground.imageId);
            campground.remove();
            req.flash('success', 'Campground deleted successfully!');
            res.redirect('/campgrounds');
        } catch (err) {
            if (err) {
                req.flash('error', err.message);
                return res.redirect('back');
            }
        }
    });
});
//Search Pattern
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}
module.exports = router;