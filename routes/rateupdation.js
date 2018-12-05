const express = require('express');
const router = express.Router();
const moment = require('moment-timezone');
let Product = require('../models/product');
let Rateupdate = require('../models/rateupdate');
router.get('/add', ensureAuthenticated, function (req, res) {
    Product.find({}, function(err, products){
        Rateupdate.find({}, function(err, rateupdates){
            res.render('rateupdation.hbs', {
                pageTitle: 'Rate Update',
                products:products,
                rateupdates:rateupdates
            });
        });
    });
});


router.post('/add', ensureAuthenticated, function(req, res){
    req.checkBody('ratechangedate', 'Date is required').notEmpty();
    let errors = req.validationErrors();
    if (errors) {
        console.log(errors);
        res.render('rateupdation.hbs', {
            pageTitle: 'Rate Update',
            errors:errors
        });
    } else {
        let productIDs = req.body.product_id;
        let productNames = req.body.product_name;
        let productPrice = req.body.product_price;
        // let retailerPrice = req.body.product_retailer_price;
        let productBrandVariation = req.body.product_brand_variation;
        // let retailerBrandPrice = req.body.retailer_brand_price;
        let productBranddifference = req.body.product_diff_variation;
        // let retailerBranddifference = req.body.retailer_product_diff;
        let productLength  = productIDs.length;
        let updationDate = req.body.ratechangedate;
        const updationDatemiliseconds = moment(updationDate, "DD/MM/YYYY").tz("Asia/Kolkata").startOf('day').format('x');
        const currenttimemiliseconds = moment().tz("Asia/Kolkata").startOf('day').format('x');
        var mainvariationarrray = {};
        if(updationDatemiliseconds == currenttimemiliseconds) {
            for (i = 0; i < productLength; i++) {
                var productID = productIDs[i];
                var newID = '_'+productID;
                var secondvariationarray = {};
                secondvariationarray['regularprice'] = productPrice[i];
                // secondvariationarray['retailerbaseprice'] = retailerPrice[i];
                secondvariationarray['productname'] = productNames[i];
                secondvariationarray['brandprice'] = productBrandVariation[newID];
                secondvariationarray['brandpricediff'] = productBranddifference[newID];
                // secondvariationarray['retailerbrandprice'] = retailerBrandPrice[newID];
                // secondvariationarray['retailerpricediff'] = retailerBranddifference[newID];
               
                mainvariationarrray[newID] = secondvariationarray;
                let product = {};
                product.regularprice = productPrice[i];
                // product.retailerbaseprice =  retailerPrice[i];
                product.brandprice =  productBrandVariation[newID];
                product.brandpricediff =  productBranddifference[newID];
                // product.retailerbrandprice = retailerBrandPrice[newID];
                // product.retailerpricediff = retailerBranddifference[newID];
                product.ratechangedate = updationDate;
                let query = {_id:productIDs[i]}
                Product.update(query, product, function(err){
                    if(err){
                        console.log(err);
                        return;
                    }
                });
            }
            let rateupdation = {};
            rateupdation.ratechangedate = updationDate;
            rateupdation.productbrandprices =  mainvariationarrray;
            let query = {ratechangedate:rateupdation.ratechangedate}
            let options = { upsert: true, new: true, setDefaultsOnInsert: true };
            Rateupdate.findOneAndUpdate(query, rateupdation, options, function(error, result) {
                if(error){
                    console.log(error);
                    return;
                }
            });
            res.redirect('/rateupdation/all');
        } else {
            let errors = 'Selected Date is Greater then or Less Then Todays Date';
            res.render('rateupdation.hbs', {
                pageTitle: 'Rate Update',
                errors:errors
            });  
        }
    }
});

router.get('/all', ensureAuthenticated, function (req, res) {
    Rateupdate.find({}, function (err, rateupdates) {
        if (err) {
            console.log(err);
        } else {
            res.render('all_rateupdation.hbs', {
                pageTitle: 'All Rate Updations',
                rateupdates: rateupdates
            });
        }
    }).sort({_id: 'asc'});
});

router.get('/:id', ensureAuthenticated, function(req, res){
    Product.find({}, function(err, products){
        Rateupdate.findById(req.params.id, function(err, rateupdate){
            if (err) {
                console.log(err);
            } else {
                res.render('rateupdate_single.hbs', {
                    pageTitle: 'Rate Update',
                    rateupdate:rateupdate,
                    products:products
                });
            }
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