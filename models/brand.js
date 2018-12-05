let mongoose = require('mongoose');

// Brand Schema
let brandSchema = mongoose.Schema({
    brandserialnumber: {
        type: Number,
        required: true
    },
    brandtitle: {
        type: String,
        required: true
    },
    branddescription: {
        type: String,
        required: true
    },
    filepath: {
        type: String,
        trim: true
    },
    filename: {
        type: String
    }
});

let Brand = module.exports = mongoose.model('Brand', brandSchema);