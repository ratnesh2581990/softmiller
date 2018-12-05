const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const moment = require('moment-timezone');
let Inquiry = require('../models/inquiry');
let User = require('../models/user');

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public/uploads/inquiries')
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

router.post('/add', upload.single('inquiryimage'), (req, res,next) => {
    req.checkBody('inquiryno', 'Inquiry Number is required').notEmpty();
    req.checkBody('inquirydate', 'Inquiry Date is required').notEmpty();
    req.checkBody('inqdescription', 'Description is required').notEmpty();
    req.checkBody('userid', 'User ID is required').notEmpty();
    req.checkBody('inquirymiliseconds', 'Inqury Miliseconds is required').notEmpty();
    let errors = req.validationErrors();
    if (errors) {
        if(req.file) {
            let filename = './public/uploads/offer/'+req.file.filename;
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
        }
        console.log(errors);
        res.json({ 'success': false, 'message': 'validation error', 'errors': errors });
    } else {
        if (req.fileValidationError) {
            res.json({ 'success': false, 'message': 'file validation error', 'errors': req.fileValidationError });     
        } else {
            // console.log('enter in else condition');
            // var file = req.file;
            // console.log(file);
            // res.json({ 'success': true, 'message': 'Inquiry Form added succesfully', 'file': file, 'body': req.body });
            // fs.readFile(req.file.path,(err, contents)=> {
            //     if (err) {
            //     console.log('Error: ', err);
            //    }else{
            //     console.log('File contents ',contents);
            //    }
            //   });
            //res.json({ 'success': true, 'message': 'Inquiry Form added succesfully', 'file': file, 'body': req.body });
            let inquiry = new Inquiry(); 
            inquiry.inquiryno = req.body.inquiryno;
            inquiry.inquirydate =  req.body.inquirydate;
            inquiry.inqdescription = req.body.inqdescription;
            inquiry.remark =  req.body.remark;
            inquiry.userid =  req.body.userid;
            inquiry.inquirymiliseconds =  req.body.inquirymiliseconds;
            if(req.file) {
                var file = req.file;
                inquiry.filepath = req.file.path;
                inquiry.filename = req.file.filename;
            } else {
                var file = '';
            }
            inquiry.save(function (err) {
                if (err) {
                    res.json({ 'success': false, 'message': 'Error in Saving Inquiry form', 'errors': err });
                    return;
                } else {
                    
                    res.json({ 'success': true, 'message': 'Inquiry Form added succesfully', 'file': file, 'body': req.body });
                }
            });
        }
    }

});

router.get('/getinquiryentryuser', function (req, res) {
    if( req.query.userid ) {
        Inquiry.find({userid: req.query.userid}, function (err, inquiries) {
            if (err) {
                res.json({ 'success': false, 'message': err });
            } else {
                res.json({ 'success': true, 'inquiries': inquiries });
            }
        }).sort({_id: 'asc'});     
    } else {
        res.json({ 'success': false, 'message': 'User Id is empty' });
    }
});

router.get('/getinquiryentrybyid', function (req, res) {
    if( req.query.entryid ) {
        Inquiry.find({_id: req.query.entryid}, function (err, inquiries) {
            if (err) {
                res.json({ 'success': false, 'message': err });
            } else {
                res.json({ 'success': true, 'inquiries': inquiries });
            }
        }).sort({_id: 'asc'});     
    } else {
        res.json({ 'success': false, 'message': 'Entry Id is empty' });
    }
});

router.get('/all', ensureAuthenticated, function (req, res) {
    Inquiry.find({}, function (err, inquiries) {
        User.find({}, 'name', function(err, users){
            if (err) {
                console.log(err);
            } else {
                res.render('all_inquiries.hbs', {
                    pageTitle: 'All Inquirys Entries',
                    inquiries: inquiries,
                    users: users
                });
            }
        });    
    }).sort({_id: 'asc'});
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