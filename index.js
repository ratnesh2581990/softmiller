const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const hbs = require('hbs');
const moment = require('moment-timezone');
let User = require('./models/user');
let Product = require('./models/product');
mongoose.set('debug', true);

const PORT = process.env.PORT || 3000;
mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://ratnesh3rde:ratnesh123@ds121861.mlab.com:21861/ecommapp');
let db = mongoose.connection;
db.once('open', function () {
    console.log('Connected to MongoDB');
});

// Check for DB errors
db.on('error', function (err) {
    console.log(err);
});

var app = express();

hbs.registerPartials(__dirname + '/views/partials');

app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.use(express.static(path.join(__dirname, 'public')));
app.use('*/css', express.static('public/css'));
app.use('*/js', express.static('public/js'));
app.use('*/images', express.static('public/images'));
app.use('*/fonts', express.static('public/fonts'));
app.use('*/uploads', express.static('public/uploads'));

hbs.registerHelper('getCurrentYear', () => {
    return new Date().getFullYear()
});

hbs.registerHelper('equal', function (lvalue, rvalue, options) {
    if (arguments.length < 3)
        throw new Error("Handlebars Helper equal needs 2 parameters");
    if (lvalue != rvalue) {
        return options.inverse(this);
    } else {
        return options.fn(this);
    }
});

hbs.registerHelper('notequal', function (lvalue, rvalue, options) {
    if (arguments.length < 3)
        throw new Error("Handlebars Helper equal needs 2 parameters");
    if (lvalue == rvalue) {
        return options.inverse(this);
    } else {
        return options.fn(this);
    }
});

hbs.registerHelper('subtract', function (lvalue, rvalue, options) {
    if (arguments.length < 3) {
        throw new Error("Handlebars Helper equal needs 2 parameters");
    }
    var newvalue = lvalue - rvalue;
    return newvalue;
});

hbs.registerHelper('sum', function (lvalue, rvalue, options) {
    if (arguments.length < 3) {
        throw new Error("Handlebars Helper equal needs 2 parameters");
    }
    var newvalue = lvalue + rvalue;
    return newvalue;
});

hbs.registerHelper('list', function(context, lvalue, rvalue, options) {
    if(context) {
        var ret = "<select class='form-control' name='"+rvalue+"' id='offerproductname'>";
        for(var i=0, j=context.length; i<j; i++) {
            if (options.fn(context[i]).trim() == lvalue.trim()) {
                ret = ret + "<option value='"+options.fn(context[i]).trim()+"' selected='' data-productid='"+context[i]._id+"'>"+options.fn(context[i]).trim()+"</option>";
            } else {
                ret = ret + "<option value='"+options.fn(context[i]).trim()+"' data-productid='"+context[i]._id+"'>"+options.fn(context[i]).trim()+"</option>";
            }
        }
        return ret + "</select>";
    } else {
        var ret = "<select class='form-control' name='"+rvalue+"' id='offerproductname'>";
        return ret + "</select>";
    }
});

hbs.registerHelper('retailerbrandprice', function(brandkey, retailprice, brandprice) {
    if(retailprice) {
        var retailerbrandprice = retailprice[brandkey];
    } else {
        var retailerbrandprice = brandprice;
    }
    return retailerbrandprice;
});

hbs.registerHelper('retailerbranddiff', function(brandkey, retailerpricediff) {
    if(retailerpricediff) {
        var pricediff = retailerpricediff[brandkey];
    } else {
        var pricediff = 0;
    }
    return pricediff;
});

hbs.registerHelper('dateformat', function (datetime, format) {
    return moment(datetime).format(format);
});

hbs.registerHelper('splitTitle', function(lvalue, options) {
    var str;
    if(lvalue) {
        str= lvalue.split(' ').join('_');
    } else {
        str = "default page";
        str= str.split(' ').join('_');
    }
    var res = str.toLowerCase();
    return res;
});

hbs.registerHelper('removeAndsign', function(lvalue, action) {
    var str;
    if(action == 'remove') {
        str= lvalue.split('-').join('&');
    } else {
        str= lvalue.split('&').join('-');
    }
    return str;
});

hbs.registerHelper('getbrandname', function(brandkey, productbrand) {
    if(productbrand) {
        var brandname = productbrand[brandkey].productbrand;
    }
    return brandname;
});

app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
}));


app.use(flash());
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});


app.use(expressValidator({
    errorFormatter: function (param, msg, value) {
        var namespace = param.split('.')
            , root = namespace.shift()
            , formParam = root;

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    }
}));

require('./config/passport')(passport);

app.use(passport.initialize());
app.use(passport.session());

app.get('*', function (req, res, next) {
    res.locals.user = req.user || null;
    next();
});

function loggedIn(req, res, next) {
    if (req.user) {
        next();
    } else {
        req.session.returnTo = req.originalUrl;
        res.redirect('/users/login');
    }
}
// Home Route
app.get('/', loggedIn, async function (req, res) {
    let usercount = await User.count();
    let productcount = await Product.count();
    res.render('index.hbs', {
        pageTitle: 'Home Page',
        usercount: usercount,
        productcount: productcount
    }); 
});


let users = require('./routes/users');
let products = require('./routes/products');
let brands = require('./routes/brands');
let categories = require('./routes/categories');
let brokers = require('./routes/brokers');
let rateupdation = require('./routes/rateupdation');
let offers = require('./routes/offers');
let payments = require('./routes/payments');
let inquires = require('./routes/inquires');
let orders = require('./routes/orders');
let pages = require('./routes/pages');
let settings = require('./routes/settings');

app.use('/users', users);
app.use('/products', products);
app.use('/brands', brands);
app.use('/categories', categories);
app.use('/brokers', brokers);
app.use('/rateupdation', rateupdation);
app.use('/offers', offers);
app.use('/payments', payments);
app.use('/inquires', inquires);
app.use('/orders', orders);
app.use('/settings', settings);
app.use('/pages', pages);

app.listen(PORT, () => console.log(`Listening on ${ PORT }`));