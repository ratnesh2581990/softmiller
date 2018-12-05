const express = require('express');
const router = express.Router();
var multer = require('multer');
var fs = require('fs');
// Category Model
let Category = require('../models/category');
let User = require('../models/user');

// Add Route
router.get('/add', ensureAuthenticated, function (req, res) {
    res.render('add_category.hbs', {
        pageTitle: 'Add Category'
    });
});


var storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public/uploads/category')
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname)
    }
});
var upload = multer({storage: storage});

router.post('/add', upload.single('catimage'), (req, res, next) => {
    req.checkBody('categorytitle', 'Title is required').notEmpty();
    req.checkBody('catdescription','Category Description is required').notEmpty();

    // Get Errors
    let errors = req.validationErrors();

    if (errors) {
        console.log(errors);
        let filename = './public/uploads/category/'+req.file.filename;
        fs.stat(filename, function (err, stats) {
            console.log(stats);//here we got all information of file in stats variable
         
            if (err) {
                return console.error(err);
            }
            fs.unlink(filename,function(err){
                 if(err) return console.log(err);
                 console.log('file deleted successfully');
            });  
         });
        res.render('add_category.hbs', {
            title: 'Add Category',
            errors: errors
        });
    } else {
        let category = new Category();
        category.categorytitle = req.body.categorytitle;
        category.catdescription = req.body.catdescription;
        category.categoryslug = req.body.categoryslug;
        category.filepath = req.file.path;
        category.filename = req.file.filename;

        category.save(function (err) {
            if (err) {
                console.log(err);
                return;
            } else {
                req.flash('success', 'Category Added');
                res.redirect('/categories/all');
            }
        });
    }
});

// Get Single Article
router.get('/all', ensureAuthenticated, function (req, res) {
    Category.find({}, function (err, categories) {
        if (err) {
            console.log(err);
        } else {
            res.render('all_category.hbs', {
                pageTitle: 'All Categories',
                categories: categories
            });
        }
    });
});

router.get('/getcategories', function (req, res) {
    Category.find({}, function (err, categories) {
        if (err) {
            res.json({ 'success': false, 'message': 'Error in fetching Category Record' });
        } else {
            res.json({ 'success': true, 'categories': categories });
        }
    });
});

// Access Control
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        req.flash('danger', 'Please login');
        req.session.returnTo = req.originalUrl;
        res.redirect('/users/login');
    }
}

module.exports = router;