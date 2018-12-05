const express = require('express');
const router = express.Router();
const moment = require('moment-timezone');
var nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const passport = require('passport');
let User = require('../models/user');
let Setting = require('../models/setting');
let Notification = require('../models/notification');

// Register Form
router.get('/register', function(req, res){
  res.render('register.hbs', {
    pageTitle: 'Sign up'
  });
});

// Register Proccess
router.post('/register', ensureNotAuthenticated, async function(req, res){
  const name = req.body.name;
  const email = req.body.email;
  const phonenumber = req.body.phonenumber;
  const password = req.body.phonenumber;
  const role = req.body.role;
  const status = req.body.status;
  const station = req.body.station;
  const myreferencecode = req.body.myreferencecode;
  const accountnumber = req.body.accountnumber;
  const referedcodeused = req.body.referedcodeused;
  const discountbyrefnumber = 0;

  req.checkBody('name', 'Name is required').notEmpty();
  req.checkBody('email', 'Email is required').notEmpty();
  req.checkBody('email', 'Email is not valid').isEmail();
  req.checkBody('role', 'Role is required').notEmpty();
  req.checkBody('phonenumber', 'phonenumber is required').notEmpty();
  req.checkBody('phonenumber', 'phonenumber is required').isNumeric();
  req.checkBody('myreferencecode', 'reference ID is required').notEmpty();
  let errors = req.validationErrors();
  if(errors){
    res.json({ 'success': false, 'message': 'validation error', 'errors': errors });
  } else {
    let userexist = await User.findOne({phonenumber: req.body.phonenumber}, '_id', function(err, user){});
    if(userexist) {
      res.json({ 'error': true, 'message': 'User already exist with this phone number' });
    } else {
      let newUser;
      var userupdate;
      if(req.body.referedcodeused){
        let userdetails = await User.findOne({myreferencecode: req.body.referedcodeused}, 'referalamout', function(err, user){});
        let userdiscountnumber = await User.findOne({myreferencecode: req.body.referedcodeused}, 'discountbyrefnumber', function(err, user){});
        var userid = userdetails._id;
        var userrefamount = userdetails.referalamout;
        var refnumber = userdiscountnumber.discountbyrefnumber;
        let referalamoutquery = await Setting.findOne({});
        let referalamout = referalamoutquery.referaldiscount;
        userrefamount = userrefamount + referalamout;
        refnumber = refnumber + 1;
        let query = {_id:userid};
        let options = { new: true };
        let userobj = {};
        userobj.referalamout = userrefamount;
        userobj.discountbyrefnumber = refnumber;
        userupdate = await User.findOneAndUpdate(query, userobj, options, function(err, result){});
        newUser = new User({
          name:name,
          email:email,
          phonenumber:phonenumber,
          password:password,
          role:role,
          status:status,
          accountnumber:accountnumber,
          station:station,
          myreferencecode:myreferencecode,
          referedcodeused:referedcodeused,
          referalamout:referalamout,
          discountbyrefnumber:discountbyrefnumber
        }); 
      } else {
        newUser = new User({
          name:name,
          email:email,
          phonenumber:phonenumber,
          password:password,
          role:role,
          status:status,
          accountnumber:accountnumber,
          station:station,
          myreferencecode:myreferencecode
        });
      }
      bcrypt.genSalt(10, function(err, salt){
        bcrypt.hash(newUser.password, salt, function(err, hash){
          if(err){
            res.json({ 'success': false, 'message': err });
          }
          newUser.password = hash;
          newUser.save(function(err){
            if(err){
              res.json({ 'success': false, 'message': err });
              return;
            } else {
              res.json({ 'success': true, 'message': 'User added succesfully', 'userupdate': userupdate });
            }
          });
        });
      });
    }
  }
});

// Login Form
router.get('/login', ensureNotAuthenticated, function(req, res){
  res.render('login.hbs', { pageTitle: 'Login', error: req.flash('error')[0] });  
});

router.get('/forgetpassword', ensureNotAuthenticated, function (req, res) {
  let message = req.query.pass;
  if(req.query.step) {
    res.render('forgetpassword.hbs', {
      pageTitle: 'Forget Password',
      userid:req.query.step
    });
  } else {
    res.render('forgetpassword.hbs', {
      pageTitle: 'Forget Password',
      message:message
    });
  }  
});

router.post('/forgetpassword', function(req, res, next){
  if(req.body.firststep) {
    req.checkBody('emailid', 'email id is required').notEmpty();
    let errors = req.validationErrors();
    if(errors){
      res.json({ 'error': true, 'message': 'validation error' });
    } else {
      User.findOne({email: req.body.emailid, status:"active"}, function(err, user){
        if(err) {
          res.json({ 'success': false, 'message': err });
        }
        if(!user){
          res.json({ 'success': false, 'message': 'No user found' });
        } else {
          var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'ratnesh3rde@gmail.com',
              pass: 'ratnesh3rde@123'
            }
          });
          if(req.hostname == 'localhost') {
            var url = req.protocol+'://'+req.hostname+':3000/users/forgetpassword/?step='+user.id;
          } else {
            var url = req.hostname+'/users/forgetpassword/?step='+user.id;
          }
          var userEmail = user.email;
          var emailText = 'please click on the below link for the forget password link';
          emailText += '<p><a href="'+url+'">click here</a>';
          var mailOptions = {
            from: 'ratnesh3rde@gmail.com',
            to: userEmail,
            subject: 'Forget Password Link',
            html: emailText
          };
          
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
              res.json({ 'success': false, 'message': error });
            } else {
              res.json({ 'success': true, 'message': 'email sent successfully' });
            }
          });
        }
      });
    }  
  } else {
    req.checkBody('newpassword', 'Password is required').notEmpty();
    let errors = req.validationErrors();
    if(errors){
      res.json({ 'error': true, 'message': 'validation error', 'error': errors });
    } else {
      User.findOne({_id: req.body.userid, status:"active"}, function(err, user){
        if(err) {
          res.json({ 'success': false, 'message': err });
        }
        if(!user){
          res.json({ 'success': false, 'message': 'No user found' });
        } else {
          bcrypt.genSalt(10, function(err, salt){
            bcrypt.hash(req.body.newpassword, salt, function(err, hash){
              if(err){
                res.json({ 'success': false, 'message': err });
              }
              let userobject = {};
              userobject.password = hash;
              let query = {_id: req.body.userid}
              User.update(query, userobject, function(err){
                if(err){
                  res.json({ 'success': false, 'message': err });
                  return;
                } else {
                  res.json({ 'success': true, 'message': 'Successfully Change the password' });
                }
              });
            });
          });
        }
      });
    }
  }
});

router.get('/phonenumbercheck', function(req, res){
  if(req.query.phonenumber) {
    User.findOne({phonenumber: req.query.phonenumber}, 'referalamout', function(err, user){
      if(err){
        res.json({ 'success': false, 'message': 'Error in finding Phone Number' });
      } 
      if(user) {
        res.json({ 'success': false, 'message': 'User already exist', 'userexist': true });
      } else {
        res.json({ 'success': true, 'message': 'User is New' });
      }
    });
  } else {
    res.json({ 'success': false, 'message': 'Phone Number is Empty' });
  }
});


router.post('/login', function(req, res, next){
  req.checkBody('phonenumber', 'phonenumber is required').isNumeric();
  req.checkBody('phonenumber', 'phonenumber is required').notEmpty();
  let errors = req.validationErrors();
  if(errors){
    // res.json({ 'error': true, 'message': 'validation error' });
    res.render('login.hbs', { pageTitle: 'Login', error: req.flash('error')[0] });
  } else {
    passport.authenticate('local', {
      successReturnToOrRedirect: '/',
      failureRedirect:'/users/login',
      failureFlash: true
    })(req, res, next);
  }
});

// Login Process
router.post('/applogin', async function(req, res, next){
  req.checkBody('phonenumber', 'phonenumber is required').isNumeric();
  req.checkBody('phonenumber', 'phonenumber is required').notEmpty();
  var offerNotification = await Notification.find({type: "All"}, function(err, notifications){});
  let errors = req.validationErrors();
  if(errors){
    res.json({ 'success': false, 'message': 'Validation Error' });
  } else {
    User.findOne({phonenumber: req.body.phonenumber, status:"active"}, function(err, user){
      if(err) {
        res.json({ 'success': false, 'message': err });
      }
      if(!user){
        res.json({ 'success': false, 'message': 'No user found' });
        
      } else {
        bcrypt.compare(req.body.password, user.password, function(err, isMatch){
          if(err) throw err;
          if(isMatch){
            Notification.find({type: "Specific", userid: user._id}, function(err, notifications){
              if(err){
                console.log(err);
              } else {
                res.json({ 'success': true, 'name': user.name, 'email': user.email, 'phonenumber': user.phonenumber, '_id':user._id, 'role':user.role, 'user':user, 'offerNotification':offerNotification, 'usernotification': notifications });
              }
            });
          } else {
            res.json({ 'success': false, 'message': 'Wrong password' });
          }
        });
      }
    });
  }
});

router.post('/usernotification', async function(req, res, next){
  req.checkBody('userid', 'phonenumber is required').notEmpty();
  let userid = req.body.userid;
  //var offerNotification = await Notification.find({type: "All"}, function(err, notifications){});
  let errors = req.validationErrors();
  if(errors){
    res.json({ 'success': false, 'message': 'Validation Error' });
  } else {
    Notification.find({type: "All"}).sort({notificationtime: 'desc'}).exec(function (err, offerNotification) {
      if(err) {
          console.log(err);
      } else {
        Notification.find({type: "Specific", userid: userid}).sort({notificationtime: 'desc'}).exec(function (err, notifications) {
          if(err) {
              console.log(err);
          } else {
            let allNotification = offerNotification.concat(notifications);
            allNotification.sort(function (a, b) {
              return a.notificationtime - b.notificationtime;
            });
            allNotification.reverse();
            res.json({ 'success': true, 'offernotification':offerNotification, 'usernotification': notifications, 'allnotification': allNotification });
          }
        });
      }
    }); 
  }
});



router.post('/changepassword', function(req, res, next){
  req.checkBody('phonenumber', 'phonenumber is required').isNumeric();
  req.checkBody('phonenumber', 'phonenumber is required').notEmpty();
  req.checkBody('newpassword', 'Password is required').notEmpty();
  if( req.body.flag == 1) {
    req.checkBody('oldpassword', 'Old Password is required').notEmpty();
  }
  let errors = req.validationErrors();
  if(errors){
    res.json({ 'success': false, 'message': errors });
  } else {
    User.findOne({phonenumber: req.body.phonenumber, status:"active", $or: [
      { 'role': "customer" },
      { 'role': "broker" }
    ]}, function(err, user){
      if(err) {
        res.json({ 'success': false, 'message': err });
      }
      if(!user){
        res.json({ 'success': false, 'message': 'No user found' });
        
      } else {
        if( req.body.flag == 1) {
          bcrypt.compare(req.body.oldpassword, user.password, function(err, isMatch){
            if(err) throw err;
            if(isMatch){
              bcrypt.genSalt(10, function(err, salt){
                bcrypt.hash(req.body.newpassword, salt, function(err, hash){
                  if(err){
                    res.json({ 'success': false, 'message': err });
                  }
                  let userobject = {};
                  userobject.password = hash;
                  let query = {phonenumber:req.body.phonenumber}
                  User.update(query, userobject, function(err){
                    if(err){
                      res.json({ 'success': false, 'message': err });
                      return;
                    } else {
                      res.json({ 'sucess': true, 'message': 'Successfully Change the password' });
                    }
                  });
                });
              });
            } else {
              res.json({ 'success': false, 'message': 'You have Entered Wrong password' });
            }
          });
        } else {
          bcrypt.genSalt(10, function(err, salt){
            bcrypt.hash(req.body.newpassword, salt, function(err, hash){
              if(err){
                res.json({ 'success': false, 'message': err });
              }
              let userobject = {};
              userobject.password = hash;
              let query = {phonenumber:req.body.phonenumber}
              User.update(query, userobject, function(err){
                if(err){
                  res.json({ 'success': false, 'message': err });
                  return;
                } else {
                  res.json({ 'sucess': true, 'message': 'Successfully Change the password' });
                }
              });
            });
          });
        }
      }
    });
  }
});

router.post('/latestuserdetails', function (req, res) {
  if(req.body.userid) {
    User.findById(req.body.userid, function(err, user){
      if(err) {
        res.json({ 'success': false, 'message': err });
      } else {
        res.json({ 'sucess': true, 'user': user });
      }
    });  
  } else {
    res.json({ 'success': false, 'message': 'please provide the user id' });
  }
});

router.post('/updatewallet', function (req, res) {
  if(req.body.userid) {
    User.findById(req.body.userid, function(err, user){
      if(err) {
        res.json({ 'success': false, 'message': err });
      } else {
        var walletamount = user.referalamout;
        let userobject = {}
        if(req.body.action == 'add') {
          userobject.referalamout = walletamount + req.body.referalamout;
        } else {
          userobject.referalamout = walletamount - req.body.referalamout;
        }
        let query = {_id:req.body.userid}
        User.update(query, userobject, function(err){
          if(err){
            res.json({ 'success': false, 'message': err });
            return;
          } else {
            res.json({ 'sucess': true, 'message': 'Successfully Update the amount' });
          }
        });
      }
    });  
  } else {
    res.json({ 'success': false, 'message': 'please provide the user id' });
  }
});

// logout
router.get('/logout', function(req, res){
  req.logout();
  req.flash('success', 'You are logged out');
  res.redirect('/users/login');
});

function ensureNotAuthenticated(req, res, next) {
  if (!req.isAuthenticated()) {
      return next();
  } else {
      req.session.returnTo = req.originalUrl;
      res.redirect('/');
  }
}

module.exports = router;
