const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const moment = require('moment-timezone');
const querystring = require('querystring');  
let Product = require('../models/product');
let Brand = require('../models/brand');
var query;

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public/uploads/product')
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


router.post('/add', upload.any(), (req, res, next) => {
    let filesArray = req.files;
    let tempArr = [];
    req.checkBody('producttitle', 'Title is required').notEmpty();
    req.checkBody('sku', 'Product Serial Number is required').notEmpty();
    req.checkBody('unit', 'Product Unit is required').notEmpty();
    let product_brand_group = req.body.product_brand_group;
    let errors = req.validationErrors();
    if (errors) {
        if(req.files) {
            filesArray.map( (item, index)=> {
                let insertfilename = './public/uploads/product/'+item.filename;
                fs.stat(insertfilename, function (err, stats) {
                    console.log(stats);//here we got all information of file in stats variable
                    if (err) {
                        return console.error(err);
                    }
                    fs.unlink(insertfilename,function(err){
                        if(err) return console.log(err);
                        console.log('file deleted successfully');
                    });  
                });
            });
        }
        res.json({ 'success': false, 'message': 'Validation error', 'errors': errors });
    } else {
        filesArray.map( (item, index)=> {
            let empObj = {};
            tempArr.push(empObj);
            tempArr[index]['path'] = item.path;
            tempArr[index]['filename'] = item.filename;
        });
        for (let index = 0; index < product_brand_group.length; index++) {
            if(tempArr[index] ? tempArr[index]['path'] : false) {
                product_brand_group[index]['filepath'] = tempArr[index]['path'];
            }

            if(tempArr[index] ? tempArr[index]['filename'] : false) {
                product_brand_group[index]['filename'] = tempArr[index]['filename'];
            } 
        }
        if(req.fileValidationError) {
            res.json({ 'success': false, 'message': 'File Validation error', errors: req.fileValidationError }); 
        } else {
            Product.findOne({sku: req.body.sku}, function(err,product) {
                if (err) {
                    res.json({ 'success': false, 'message': 'Error in Checking Sku Duplicate', errors: err });
                }
                if(!product) {
                    let product = new Product();
                    product.producttitle = req.body.producttitle;
                    product.productbody = req.body.productbody;
                    product.sku = req.body.sku;
                    product.unit = req.body.unit;
                    product.creationdate = moment().tz("Asia/Kolkata");
                    var startmiliseconds = moment().tz("Asia/Kolkata").format('x');
                    product.datemiliseconds = startmiliseconds;
                    let obje = {};
                    for (let index = 0; index < product_brand_group.length; index++) {
                        const element = product_brand_group[index]['productbrand'];
                        obje[element] = 0;
                    }
                    product.regularprice = 0;
                    product.brandprice =  obje;
                    product.productbrand = product_brand_group;
                    product.ratechangedate = moment().tz("Asia/Kolkata").format('DD/MM/YYYY');
                    product.save(function (err) {
                        if (err) {
                            console.log(err);
                            return;
                        } else {
                            res.json({ 'success': true, 'message': 'Product Added'});
                        }
                    });
                } else {
                    query = querystring.stringify({
                        "err": 'Duplicate Product Serial Number'
                    });
                    res.json({ 'success': false, 'message': 'Duplicate Product Serial Number', serialerror: 'Duplicate Product Serial Number' });
                }
            });
        }
    }
});

router.get('/all', ensureAuthenticated, function (req, res) {
    let message = req.query.success;
    Product.find({}, function (err, products) {
        Brand.find({}, function (err, brands) {
            if (err) {
                console.log(err);
            } else {
                res.render('allprodct.hbs', {
                    pageTitle: 'All Products',
                    products:products,
                    message:message,
                    brands: brands
                });
            }
        });
    }).sort({sku: 'asc'});
});

router.get('/getproduct', function (req, res) {
    if( req.query.page ) {
        var page = JSON.parse(req.query.page) || 1;
        var perPage = JSON.parse(req.query.perpage) || 2;
        Product
        .find({})
        .skip((perPage * page) - perPage)
        .limit(perPage)
        .sort({producttitle: 'asc'})
        .exec(function(err, products) {
            Product.count().exec(function(err, count) {
                if (err) {
                    res.json({ 'success': false, 'message': 'Error In fetching products' });
                } else {
                    let pages = Math.ceil(count / perPage);
                    res.json({ 'success': true, 'products': products, 'page': page, 'pages': pages, 'perpage': perPage });
                }
            });
        });
    } else {
        Product.find({}, function (err, products) {
            if (err) {
                res.json({ 'success': false, 'message': 'Error In fetching products' });
            } else {
                res.json({ 'success': true, 'data': products });
            }
        }).sort({producttitle: 'asc'}); 
    } 
});

router.get('/getproductbybrand', function (req, res) {
    if( req.query.page ) {
        var page = JSON.parse(req.query.page) || 1;
        var perPage = JSON.parse(req.query.perpage) || 5;
        Product
        .find({productbrand: { $elemMatch: { productbrand: req.query.brand } }})
        .skip((perPage * page) - perPage)
        .limit(perPage)
        .exec(function(err, products) {
            Product.count().exec(function(err, count) {
                if (err) {
                    res.json({ 'success': false, 'message': 'Error In fetching products' });
                } else {
                    let pages = Math.ceil(count / perPage);
                    res.json({ 'success': true, 'products': products, 'page': page, 'pages': pages, 'perpage': perPage });
                }
            });
        });
    } else {
        var page = 1;
        var perPage = 5;
        Product
        .find({productbrand: { $elemMatch: { productbrand: req.query.brand } }})
        .skip((perPage * page) - perPage)
        .limit(perPage)
        .exec(function(err, products) {
            Product.count().exec(function(err, count) {
                if (err) {
                    res.json({ 'success': false, 'message': 'Error In fetching products' });
                } else {
                    let pages = Math.ceil(count / perPage);
                    res.json({ 'success': true, 'products': products, 'page': page, 'pages': pages, 'perpage': perPage });
                }
            });
        });
    }
});

router.get('/productsearch', async function(req, res){
    if( req.query.productstring ) {
        var page = (req.query.page) ? JSON.parse(req.query.page) : 1;
        var perPage = (req.query.perpage) ? JSON.parse(req.query.perpage) : 5;
        let productsCheck = await Product.find({producttitle: req.query.productstring}, function(err, productsCallback){});
        console.log(productsCheck);
        if(productsCheck.length == 0) {
            Product.find({producttitle: { $regex: req.query.productstring, $options : 'i' }}).skip((perPage * page) - perPage).limit(perPage).sort({producttitle: 'asc'}).exec(function(err, productsResult) {
                if(productsResult.length != 0) {
                    Product.count({producttitle: { $regex: req.query.productstring }}).exec(function(err, count) {
                        if (err) {
                            res.json({ 'success': false, 'message': 'Error In fetching products' });
                        } else {
                            let pages = Math.ceil(count / perPage);
                            res.json({ 'success': true, 'products': productsResult, 'page': page, 'pages': pages, 'perpage': perPage });
                        }
                    });  
                } else {
                    Brand.find({brandtitle: { $regex: req.query.productstring, $options : 'i' }}).skip((perPage * page) - perPage).limit(perPage).sort({brandtitle: 'asc'}).exec(function(err, brandsResults) {
                        Brand.count({brandtitle: { $regex: req.query.productstring }}).exec(function(err, count) {
                            if (err) {
                                res.json({ 'success': false, 'message': 'Error In fetching Results' });
                            } else {
                                let pages = Math.ceil(count / perPage);
                                res.json({ 'success': true, 'products': brandsResults, 'page': page, 'pages': pages, 'perpage': perPage, 'brand': true });
                            }
                        });
                    });
                } 
            });
        } else {
            console.log('else');
            res.json({ 'success': true, 'products': products });
        }
    } else {
        res.json({ 'success': false, 'message': 'Error In fetching products' });
    } 
});


router.get('/:id', ensureAuthenticated, function(req, res){
    Product.findById(req.params.id, function(err, product){
        Brand.find({}, function (err, brands) {
            if (err) {
                console.log(err);
            } else {
                res.json({ 'success': true, 'product': product, 'brands' : brands });
            }
        });
    });
});

router.get('/:id', ensureAuthenticated, function(req, res){
    Product.findById(req.params.id, function(err, product){
        Brand.find({}, function (err, brands) {
            if (err) {
                console.log(err);
            } else {
                res.json({ 'success': true, 'product': product, 'brands' : brands });
            }
        });
    });
});

router.post('/edit/:id', upload.any(), function(req, res){
    let filesArray = req.files;
    let tempArr = [];
    req.checkBody('producttitle', 'Title is required').notEmpty();
    req.checkBody('sku', 'Product Serial Number is required').notEmpty();
    req.checkBody('unit', 'Product Unit is required').notEmpty();
    let product_brand_group = req.body.product_brand_group;
    let errors = req.validationErrors();
    if (errors) {
        if(req.files) {
            filesArray.map( (item, index)=> {
                let insertfilename = './public/uploads/product/'+item.filename;
                fs.stat(insertfilename, function (err, stats) {
                    console.log(stats);//here we got all information of file in stats variable
                    if (err) {
                        return console.error(err);
                    }
                    fs.unlink(insertfilename,function(err){
                        if(err) return console.log(err);
                        console.log('file deleted successfully');
                    });  
                });
            });
        }
        res.json({ 'success': false, 'message': 'Validation error', 'errors': errors });
    } else {
        filesArray.map( (item, index)=> {
            let empObj = {};
            tempArr.push(empObj);
            tempArr[index]['fieldname'] = item.fieldname;
            tempArr[index]['path'] = item.path;
            tempArr[index]['filename'] = item.filename;
        });
        var tempFieldname;
        for (let index = 0; index < tempArr.length; index++) {
            tempFieldname = tempArr[index]['fieldname'];
            tempFieldname = tempFieldname.trim();
            var arrayindex = tempFieldname.substring(0, tempFieldname.indexOf("]") + 1);
            arrayindex = arrayindex.replace("product_brand_group[", "");
            arrayindex = arrayindex.replace("]", "");
            product_brand_group[arrayindex]['filepath'] = tempArr[index]['path'];
            product_brand_group[arrayindex]['filename'] = tempArr[index]['filename'];
        }
        if(req.fileValidationError) {
            res.json({ 'success': false, 'message': 'File Validation error', errors: req.fileValidationError }); 
        } else {
            let product = {};
            product.producttitle = req.body.producttitle;
            product.productbody = req.body.productbody;
            product.sku = req.body.sku;
            product.unit = req.body.unit;
            product.productbrand = product_brand_group;
            product.modifieddate = moment().tz("Asia/Kolkata");
            if(req.files) {
                product_brand_group.map( (item, index)=> {
                    if(item.previousfilename != item.filename) {
                        let previousFilename = './public/uploads/product/'+item.previousfilename;
                        fs.stat(previousFilename, function (err, stats) {
                            if (err) {
                                return console.error(err);
                            }
                            fs.unlink(previousFilename,function(err){
                                if(err) return console.log(err);
                                console.log('file deleted successfully');
                            });  
                        });
                    }
                });
            }
            let query = {_id:req.params.id}
            Product.update(query, product, function(err){
                if(err){
                    res.json({ 'success': false, 'message': 'Error in Updating Product', errors: err });
                } else {
                    res.json({ 'success': true, 'message': 'Product Updated'});
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
    Product.findById(req.params.id, function(err, product){
        Product.remove(query, function(err){
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