const express = require('express');
const router = express.Router();
var path = require('path');
const moment = require('moment-timezone');
var fs = require('fs');
var multer = require('multer');
let Brand = require('../models/brand');

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public/uploads/brands')
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname)
    }
});
var upload = multer({
    storage: storage,
    fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname);
        if(ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
            req.fileValidationError = "Forbidden extension";
            return callback(null, false, req.fileValidationError);
        }
        callback(null, true)
    },
    limits:{
        fileSize: 420 * 150 * 200
    }
});

router.post('/add', upload.single('brandimage'), (req, res, next) => {
    req.checkBody('brandtitle', 'Title is required').notEmpty();
    req.checkBody('brandserialnumber', 'Brand Serial is required').notEmpty();
    req.checkBody('brandserialnumber', 'Brand Serial is Number Only').isNumeric();
    req.checkBody('branddescription', 'Brand Description is required').notEmpty();
    let errors = req.validationErrors();
    if (errors) {
        if(req.file) {
            let filename = './public/uploads/brands/'+req.file.filename;
            fs.stat(filename, function (err, stats) {
                //console.log(stats);//here we got all information of file in stats variable
                if (err) {
                    return console.error(err);
                   
                }
                fs.unlink(filename,function(err){
                    if(err) return console.log(err);
                    console.log('file deleted successfully');
                });  
            });
        }
        res.json({ 'success': false, 'message': 'Validation error', errors: errors });
    } else {
        if (req.fileValidationError) {  
            res.json({ 'success': false, 'message': 'File Validation error', errors: req.fileValidationError });   
        } else {
            Brand.findOne({brandserialnumber: req.body.brandserialnumber}, function(err,brand) {
                if (err) {
                    res.json({ 'success': false, 'message': 'Brand Serial error', errors: err });
                }
                if(!brand) {
                    let brand = new Brand();
                    brand.brandserialnumber = req.body.brandserialnumber;
                    brand.brandtitle = req.body.brandtitle;
                    brand.branddescription = req.body.branddescription;
                    if(req.file) {
                        brand.filepath = req.file.path;
                        brand.filename = req.file.filename;
                    }
                    brand.save(function (err) {
                        if (err) {
                            res.json({ 'success': false, 'message': 'Error in Saving Brand', errors: err });
                        } else {
                            res.json({ 'success': true, 'message': 'Brand Added'});
                        }
                    });
                } else {
                    res.json({ 'success': false, 'message': 'Brand Serial error', serialerror: 'duplicate serial number' });
                }
            });
        }      
    }
});

// Get Single Article
router.get('/all', ensureAuthenticated, function (req, res) {
    Brand.find({}, function (err, brands) {
        if (err) {
            console.log(err);
        } else {
            res.render('all_brands.hbs', {
                pageTitle: 'All Brands',
                brands: brands
            });
        }
    }).sort({brandserialnumber: 'asc'});
});

router.get('/getbrands', function (req, res) {
    Brand.find({}, function (err, brands) {
        if (err) {
            res.json({ 'success': false, 'message': 'Error in fetching Brands Record' });
        } else {
            res.json({ 'success': true, 'brands': brands });
        }
    }).sort({brandserialnumber: 'asc'});
});

router.get('/:id', ensureAuthenticated, function(req, res){
    Brand.findById(req.params.id, function(err, brand){
        if (err) {
            res.json({ 'success': false, 'message': 'error in fetching Brand details' });
        } else {
            res.json({ 'success': true, 'brand': brand });
        }
    });
});


router.post('/edit/:id', upload.single('brandimage'), function(req, res){
    req.checkBody('brandtitle', 'Title is required').notEmpty();
    req.checkBody('branddescription', 'Brand Description is required').notEmpty();
    let errors = req.validationErrors();
    if (errors) {
        if(req.file) {
            let filename = './public/uploads/brands/'+req.file.filename;
            fs.stat(filename, function (err, stats) {
                console.log(stats);
                if (err) {
                    return console.error(err);
                }
                fs.unlink(filename,function(err){
                    if(err) return console.log(err);
                    console.log('file deleted successfully');
                });  
            });
        }
        res.json({ 'success': false, 'message': 'Validation error', errors: errors });
    } else {
        if (req.fileValidationError) {
            res.json({ 'success': false, 'message': 'File Validation error', errors: req.fileValidationError });    
        } else {
            let brand = {};
            brand.brandtitle = req.body.brandtitle;
            brand.branddescription = req.body.branddescription;
            if(req.file) {
                brand.filepath = req.file.path;
                brand.filename = req.file.filename;
                let previousFilename = './public/uploads/brands/'+req.body.previousfilename;
                fs.stat(previousFilename, function (err, stats) {
                    console.log(stats);
                    if (err) {
                        return console.error(err);
                    }
                    fs.unlink(previousFilename,function(err){
                        if(err) return console.log(err);
                        console.log('file deleted successfully');
                    });  
                });
            }
            let query = {_id:req.params.id}
            Brand.update(query, brand, function(err){
                if(err){
                    res.json({ 'success': false, 'message': 'Error in Updating Brand', errors: err });
                } else {
                    res.json({ 'success': true, 'message': 'Brand Updated'});
                }
            });
        }
    }
});

router.delete('/:id', function(req, res){
    if(!req.user._id){
      res.status(500).send();
    }
    let query = {_id:req.params.id}
    Brand.findById(req.params.id, function(err, brand){
        Brand.remove(query, function(err){
          if(err){
            console.log(err);
          }
          res.send('Success');
        });
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