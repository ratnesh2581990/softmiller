let mongoose = require('mongoose');

// Product Schema
let productSchema = mongoose.Schema({
    producttitle: {
        type: String,
        required: true
    },
    productbody: {
        type: String,
    },
    sku: {
        type: String,
         required: true
    },
    unit: {
        type: String,
        required: true
    },
    productbrand: {
        type: Array
    },
    brandprice: {
        type: Object,
    },
    brandpricediff: {
        type: Object,
    },
    retailerbrandprice: {
        type: Object,
    },
    retailerpricediff: {
        type: Object,
    },
    regularprice: {
        type: Number,
    },
    retailerbaseprice: {
        type: Number,
    },
    filepath: {
        type: String,
        trim: true
    },
    filename: {
        type: String
    },
    ratechangedate:{
        type: String
    },
    creationdate: {
        type: Date,
        required: true,
        default: Date.now
    },
    datemiliseconds: {
        type: Number,
        required: true
    },
    modifieddate: {
        type: Date
    }
});

let Product = module.exports = mongoose.model('Product', productSchema);