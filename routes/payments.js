const express = require('express');
const router = express.Router();
const moment = require('moment-timezone');
let Payment = require('../models/payment');
let Delivery = require('../models/delivery');
let User = require('../models/user');

router.post('/add', function(req, res) {
    req.checkBody('orderid', 'Order Id is required').notEmpty();
    req.checkBody('orderid', 'Order Id is number only').isNumeric();
    req.checkBody('bankname', 'Bank Name is required').notEmpty();
    req.checkBody('neft', 'NEFT Field is required').notEmpty();
    req.checkBody('transferamount', 'Amount is required').notEmpty();
    req.checkBody('transferamount', 'Amount is number only').isNumeric();
    req.checkBody('userid', 'User ID is required').notEmpty();
    req.checkBody('paymentdate', 'Payment Entry Date is required').notEmpty();
    req.checkBody('paymentmiliseconds', 'Payment Entry Miliseconds is required').notEmpty();
    let errors = req.validationErrors();
    if (errors) {
        console.log(errors);
        res.json({ 'success': false, 'message': 'validation error', 'errors': errors });
    } else {
        let query = {};
        query.deliveryid = req.body.orderid;
        let payment = new Payment();
        let orderID = req.body.orderid;
        let bankName = req.body.bankname;
        let neft = req.body.neft;
        let transferAmount = req.body.transferamount;    
        payment.orderid = orderID;
        payment.bankname =  bankName;
        payment.neft = neft;
        payment.transferamount =  transferAmount;
        payment.userid =  req.body.userid;
        payment.paymentdate =  req.body.paymentdate;
        payment.paymentmiliseconds =  req.body.paymentmiliseconds;
        let delivery = {};
        delivery.paymentflag = 1;
        payment.save(function (err) {
            if (err) {
                res.json({ 'success': false, 'message': 'Error in Saving Payment form', 'errors': err });
                return;
            } else {
                Delivery.updateOne(query, delivery, function(err, obj) {
                    console.log(err);
                    if(obj.nModified != 0) {
                        res.json({ 'success': true, 'message': 'Payment Form added succesfully' });
                    } else {
                        res.json({ 'success': false, 'message': 'Error in Changing Payment flag in delivery table', 'errors': err });
                        return;
                    }
                });
            }
        });
    }
});

router.get('/getpaymententryuser', function (req, res) {
    if( req.query.userid ) {
        Payment.find({userid: req.query.userid}, function (err, payments) {
            if (err) {
                res.json({ 'success': false, 'message': err });
            } else {
                res.json({ 'success': true, 'payments': payments });
            }
        }).sort({_id: 'desc'});     
    } else {
        res.json({ 'success': false, 'message': 'User Id is empty' });
    }
});

router.get('/getpaymententrybyid', function (req, res) {
    if( req.query.entryid ) {
        Payment.find({_id: req.query.entryid}, function (err, payments) {
            if (err) {
                res.json({ 'success': false, 'message': err });
            } else {
                res.json({ 'success': true, 'payments': payments });
            }
        }).sort({_id: 'asc'});     
    } else {
        res.json({ 'success': false, 'message': 'User Id is empty' });
    }
});

router.get('/all', ensureAuthenticated, function (req, res) {
    Payment.find({}, function (err, payments) {
        User.find({}, 'name', function(err, users){
            if (err) {
                console.log(err);
            } else {
                res.render('all_payments_entry.hbs', {
                    pageTitle: 'All Payments Entries',
                    payments: payments,
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