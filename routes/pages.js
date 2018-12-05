
const express = require('express');
const router = express.Router();
const moment = require('moment-timezone');
let Page = require('../models/page');

router.post('/add', async function(req, res) {
    req.checkBody('pagetitle', 'Page Title is required').notEmpty();
    req.checkBody('pagebody', 'Page Content is required').notEmpty();
    let errors = req.validationErrors();
    if (errors) {
        console.log(errors);
        res.json({ 'success': false, 'message': 'validation error', 'errors': errors });
    } else {
        var pageExist = await Page.findOne({pagetitle: req.body.pagetitle}, '_id', function(err, user){});
        if(pageExist){
            res.json({ 'success': false, 'message': 'Page already exist with this Title', 'serialerror': 'Page already exist with this Title' });
        } else {
            let currentMiliseconds = moment().tz("Asia/Kolkata").format('x');
            let page = new Page();    
            page.pagetitle = req.body.pagetitle;
            page.pagebody = req.body.pagebody;
            page.creationdate = currentMiliseconds;
            page.save(function (err) {
                if (err) {
                    res.json({ 'success': false, 'message': 'Error in Saving Page', 'errors': err });
                    return;
                } else {
                    res.json({ 'success': true, 'message': 'Page added succesfully' });
                }
            });
        }
    }
});

router.get('/all', ensureAuthenticated, function (req, res) {
    Page.find({}).sort({_id: 'desc'}).exec(function (err, pages) {
        if(err) {
            console.log(err);
        } else {
            res.render('all_pages.hbs', {
                pageTitle: 'All Pages',
                pages: pages
            });
        }
    });
});

router.get('/allpages',function (req, res) {
    Page.find({}).sort({_id: 'desc'}).exec(function (err, pages) {
    if(err) {
        res.json({ 'success': false, 'message': err });
    } else {
        res.json({ 'success': true, 'pages': pages });
    }
  });
});

router.get('/:id', ensureAuthenticated, function(req, res){
    Page.findById(req.params.id).sort({_id: 'desc'}).exec(function (err, page) {
        if(err) {
            res.json({ 'success': false, 'message': err });
        } else {
            res.json({ 'success': true, 'page': page });
        }
      });
});

router.post('/edit/:id', function(req, res){
    req.checkBody('pagetitleedit', 'Page Title is required').notEmpty();
    req.checkBody('pagebodyedit', 'Page Content is required').notEmpty();
    let errors = req.validationErrors();
    if (errors) {
        res.json({ 'success': false, 'message': 'Validation error', errors: errors });
    } else {
        let page = {};
        page.pagetitle = req.body.pagetitleedit;
        page.pagebody = req.body.pagebodyedit;
        let query = {_id:req.params.id}
        Page.update(query, page, function(err){
            if(err){
                res.json({ 'success': false, 'message': 'Error in Updating Page', errors: err });
            } else {
                res.json({ 'success': true, 'message': 'Page Updated'});
            }
        });
    }
});

router.delete('/:id', function(req, res){
    if(!req.user._id){
      res.status(500).send();
    }
    let query = {_id:req.params.id}
    Page.findById(req.params.id, function(err, page){
        Page.remove(query, function(err){
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