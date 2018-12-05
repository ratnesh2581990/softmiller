const express = require('express');
const router = express.Router();
const moment = require('moment-timezone');
let Order = require('../models/order');
let Delivery = require('../models/delivery');
let User = require('../models/user');
let Notification = require('../models/notification');
router.post('/add', function(req, res) {
    req.checkBody('customername', 'Customer Name is required').notEmpty();
    req.checkBody('brokername', 'Broker Name is required').notEmpty();
    req.checkBody('amount', 'Price is required').notEmpty();
    req.checkBody('amount', 'Price Shuold be Number only').isNumeric();
    req.checkBody('orderid', 'Order ID is required').notEmpty();
    req.checkBody('orderid', 'Order ID Shuold be Number only').isNumeric();
    req.checkBody('orderdate', 'Order Date is required').notEmpty();
    req.checkBody('userid', 'User ID is required').notEmpty();
    req.checkBody('transportcharge', 'Transport Charge is required').notEmpty();
    req.checkBody('ordermilisecond', 'Order miliseconds is required').notEmpty();
    req.checkBody('walletamountused', 'Wallet Amount Used is required').notEmpty();
    req.checkBody('walletamountused', 'Wallet Amount Used Shuold be Number only').isNumeric();
    let errors = req.validationErrors();
    if (errors) {
        console.log(errors);
        res.json({ 'success': false, 'message': 'validation error', 'errors': errors });
    } else {
        let order = new Order();    
        order.customername = req.body.customername;
        order.brokername = req.body.brokername;
        order.amount = req.body.amount;
        order.orderid = req.body.orderid;
        order.orderdate = req.body.orderdate;
        order.ordernote = req.body.ordernote;
        order.cartobject = req.body.cartobject;
        order.userid =  req.body.userid;
        order.transportcharge = req.body.transportcharge;
        order.ordermilisecond = req.body.ordermilisecond;
        order.customernumber = req.body.customernumber;
        order.brokernumber = req.body.brokernumber;
        order.walletamountused = req.body.walletamountused;
        order.user_id = req.body.user_id;

        order.save(function (err) {
            if (err) {
                res.json({ 'success': false, 'message': 'Error in Saving Order', 'errors': err });
                return;
            } else {
                res.json({ 'success': true, 'message': 'Order added succesfully' });
            }
        });
    }
});

router.get('/getordersbyuser', function (req, res) {
    if( req.query.userid ) {
        Order.find({userid: req.query.userid}, function (err, orders) {
            if (err) {
                res.json({ 'success': false, 'message': err });
            } else {
                res.json({ 'success': true, 'orders': orders });
            }
        }).sort({orderdate: 'desc'});
    } else {
        res.json({ 'success': false, 'message': 'User Id is empty' });
    }
});

router.get('/getorderbyid', function (req, res) {
    if( req.query.orderid ) {
        Order.find({orderid: req.query.orderid}, function (err, orders) {
            if (err) {
                res.json({ 'success': false, 'message': err });
            } else {
                res.json({ 'success': true, 'orders': orders });
            }
        }).sort({_id: 'asc'});     
    } else {
        res.json({ 'success': false, 'message': 'User Id is empty' });
    }
});

router.get('/orderdetail', ensureAuthenticated, function (req, res) {
    const firstDay = moment().tz("Asia/Kolkata").startOf('month');
    const lastDay   = moment().tz("Asia/Kolkata").endOf('month');
    Order.
    find({$and: [{orderdate:{$gte:firstDay}},{orderdate:{$lte:lastDay}}]}).
      populate('userid').
      sort({_id: 'desc'}).
      exec(function (err, orders) {
        if(err) {
            console.log(err);
        } else {
            res.render('order_details_page.hbs', {
                pageTitle: 'Order Details Page',
                orders: orders
            });
        }
    });
});

router.post('/orderdetail', function(req, res) {
    var startdate = req.body.startdate;
    var enddate = req.body.enddate;
    const startmiliseconds = moment(startdate, "DD/MM/YYYY").tz("Asia/Kolkata").startOf('month').format('x');
    const endmiliseconds = moment(enddate, "DD/MM/YYYY").tz("Asia/Kolkata").endOf('month').format('x');
    Order.
    find({$and: [{ordermilisecond:{$gte:startmiliseconds}},{ordermilisecond:{$lte:endmiliseconds}}]}).
    populate('userid').
    sort({orderid: 'desc'})
    .exec(function (err, orders) {
        if(err) {
            console.log(err);
        } else {
            res.json({ 'success': true, 'orders': orders });
        }
    });
});

router.get('/ordersingledetail', function(req, res){
    var key = req.query.key
    key = key.split('-').join('&');
    Order.
findById(req.query.id).
  populate('userid').
  sort({_id: 'desc'}).
  exec(function (err, order) {
    if (err) {
        console.log(err);
    } else {
        var orderobject = {};
        orderobject.date = order.ordermilisecond;
        orderobject.customername = order.customername;
        orderobject.brokername = order.brokername;
        orderobject.customernumber = order.customernumber;
        orderobject.brokernumber = order.brokernumber;
        orderobject.user_id = order.user_id;
        orderobject.id = order._id;
        orderobject.orderid = order.orderid;
        orderobject.amount = order.amount;
        orderobject.ordernote = order.ordernote;
        orderobject.userid = order.userid;
        orderobject.transportcharge = order.transportcharge;
        orderobject.key = key;
        let cartarray = order.cartobject;
        for (let index = 0; index < cartarray.length; index++) {
            let delivary = cartarray[index][key];
            if (typeof delivary === "undefined") {
                console.log("something is undefined");
            } else {
                res.render('order_single_details.hbs', {
                    pageTitle: 'Order Single Detail',
                    delivary: delivary,
                    orderobject: orderobject,
                    objectindex: index
                });
            }
        }
    }
  });
});

router.post('/ordersingledetail', function(req, res){
    var key = req.body.objectkey;
    var deliveredQty = req.body.delivaryquantity;
    var quantity = req.body.quantity;
    var balancequantity = quantity - deliveredQty;
    req.checkBody('orderid', 'Order ID is required').notEmpty();
    req.checkBody('orderid', 'Order ID Shuold be Number only').isNumeric();
    req.checkBody('delivaryquantity', 'Delivary Quantity is required').notEmpty();
    req.checkBody('delivaryquantity', 'Delivary Quantity Shuold be Number only').isNumeric();
    req.checkBody('balancequantity', 'Balanced Quantity is required').notEmpty();
    req.checkBody('balancequantity', 'Balanced Quantity Shuold be Number only').isNumeric();
    req.checkBody('userid', 'User ID is required').notEmpty();
    let errors = req.validationErrors();
    if (errors) {
        res.render('order_details_page.hbs', {
            pageTitle: 'Order Details Page',
            errors: errors
        });
    } else {
        let cartKey = 'cartobject.'+key;
        let query = {};
        query.orderid = req.body.orderid;
        query[cartKey] = { $exists: true };
        var setObject = {};
        setObject["cartobject.$."+ key +".deliveredQty"] = deliveredQty;
        setObject["cartobject.$."+ key +".balanceQty"] = balancequantity;
        Order.updateOne(query, {'$set': setObject}, function(err, obj) {
            if(err) {
                console.log(err);
                res.render('order_details_page.hbs', {
                    pageTitle: 'Order Details Page',
                    errors: err
                });
            } else {
                if(obj.nModified != 0) {
                    Delivery.count({}, function(err, count) {
                        console.log(err);
                        let cartobject = {};
                        cartobject.sku = req.body.sku;
                        cartobject.brandSerialNumber = req.body.brandSerialNumber;
                        cartobject.quantity = quantity;
                        cartobject.productName = req.body.productName;
                        cartobject.brand = req.body.brand;
                        cartobject.pack = req.body.pack;
                        cartobject.price = req.body.price;
                        cartobject.brandPrice = req.body.brandPrice;
                        cartobject.deliveredQty = deliveredQty;
                        cartobject.balanceQty = balancequantity;
                        cartobject.offerPrice = req.body.offerPrice;
                        cartobject.staticOfferPrice = req.body.staticOfferPrice;
                        cartobject.offerId = req.body.offerId;
                        let delivery = new Delivery();
                        var date = moment().tz("Asia/Kolkata");
                        delivery.deliveryid = count + 1;
                        delivery.orderid = req.body.orderid;
                        delivery.customernumber = req.body.customernumber;
                        delivery.brokernumber = req.body.brokernumber;
                        delivery.user_id = req.body.user_id;
                        delivery.orderdate = req.body.orderdate;
                        delivery.deliverydate = date;
                        delivery.cartobject = cartobject;
                        delivery.deliverymilisecond = moment().tz("Asia/Kolkata").format('x');
                        delivery.userid = req.body.userid;
                        delivery.save(function (err) {
                            if (err) {
                                console.log(err);
                                res.render('order_details_page.hbs', {
                                    pageTitle: 'Order Details Page',
                                    errors: err
                                });
                            } else {
                                var orderdate = moment(req.body.orderdate, "x").tz("Asia/Kolkata").format('DD/MM/YYYY h:mm:ss a');
                                var userid = req.body.userid;
                                var title = "Order Items Delivered";
                                var offermessage = 'Suplier has Delivered '+deliveredQty+' quantity of '+req.body.productName +' '+req.body.brand+' '+req.body.pack.packvalue+' kg for your order Id '+req.body.orderid+' done on '+orderdate;
                                var notificationtime = moment().tz("Asia/Kolkata").format('x');
                                var type = "Specific";
                                var flag = 0;
                                let notification = new Notification();
                                notification.title = title;
                                notification.content = offermessage;
                                notification.type = type;
                                notification.notificationtime = notificationtime;
                                notification.readflag = flag;
                                notification.userid = userid;
                                notification.save(function (err) {
                                    if (err) {
                                        console.log(err);
                                        return;
                                    } else {
                                        console.log('notification saved successfully');
                                    }
                                });
                                req.flash('success', 'Delivary Updated');
                                res.redirect('/orders/orderdetail');
                            }
                        });
                    });
                } else {
                    res.render('order_details_page.hbs', {
                        pageTitle: 'Order Details Page',
                        errors: 'Update Operation failed'
                    });  
                }   
            }
        });
    }
});

router.get('/all', ensureAuthenticated, function (req, res) {
    Order.
find({}).
  populate('userid').
  sort({_id: 'desc'}).
  exec(function (err, orders) {
    if(err) {
        console.log(err);
    } else {
        res.render('all_orders.hbs', {
            pageTitle: 'All Orders',
            orders: orders
        });
    }
  });
});

router.get('/allorder',function (req, res) {
    Order.
find({}).
  populate('userid').
  sort({_id: 'desc'}).
  exec(function (err, orders) {
    if(err) {
        res.json({ 'success': false, 'message': err });
    } else {
        res.json({ 'success': true, 'orders': orders });
    }
  });
});

router.get('/allorderbydate',function (req, res) {
    var DateSplit, orderDate, start, end, startmiliseconds, endmiliseconds ;
    if(req.query.date) {
        startmiliseconds = moment(orderDate, "DD/MM/YYYY").tz("Asia/Kolkata").startOf('day').format('x');
        endmiliseconds = moment(orderDate, "DD/MM/YYYY").tz("Asia/Kolkata").endOf('day').format('x');
    } else {
        startmiliseconds = moment().tz("Asia/Kolkata").startOf('day').format('x');
        endmiliseconds = moment().tz("Asia/Kolkata").endOf('day').format('x'); 
    }
    Order.
    find({$and: [{ordermilisecond:{$gte:startmiliseconds}},{ordermilisecond:{$lte:endmiliseconds}}]}).
      populate('userid').
      sort({_id: 'desc'}).
      exec(function (err, orders) {
        if(err) {
            res.json({ 'success': false, 'message': err });
        } else {
            res.json({ 'success': true, 'orders': orders });
        }
      });
});

router.get('/deliverybyuserid',function (req, res) {
    Delivery.find({userid: req.query.userid, paymentflag: 0}, 'deliveryid', function (err, deliveries) {
        if (err) {
            res.json({ 'success': false, 'message': err });
        } else {
            res.json({ 'success': true, 'deliveries': deliveries });
        }
    }).sort({_id: 'desc'});
});

router.get('/deliverybydeliveryid',function (req, res) {
    Delivery.findById(req.query.id, function (err, delivery) {
        if (err) {
            res.json({ 'success': false, 'message': err });
        } else {
            res.json({ 'success': true, 'delivery': delivery });
        }
    }).sort({_id: 'desc'});
});

router.get('/deliverybyorderid',function (req, res) {
    Order.findOne({orderid: req.query.orderid}, function (err, order) {
        if (err) {
            res.json({ 'success': false, 'message': err });
        } else {
            Delivery.find({orderid: req.query.orderid}, function (err, deliveries) {
                if (err) {
                    res.json({ 'success': false, 'message': err });
                } else {
                    res.json({ 'success': true, 'deliveries': deliveries, 'order': order });
                }
            }).sort({_id: 'desc'});
        }     
    }).sort({_id: 'desc'});
});


router.get('/:id', ensureAuthenticated, function(req, res){
    Order.
    findById(req.params.id).
      populate('userid').
      sort({_id: 'desc'}).
      exec(function (err, order) {
        if(err) {
            console.log(err);
        } else {
            res.render('order_single.hbs', {
                pageTitle: 'Order',
                order:order
            });
        }
      });
});

router.delete('/:id', function(req, res){
    if(!req.user._id){
      res.status(500).send();
    }
    let query = {_id:req.params.id}
    Order.findById(req.params.id, function(err, order){
        Order.remove(query, function(err){
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