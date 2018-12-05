let mongoose = require('mongoose');

// Category Schema
let categorySchema = mongoose.Schema({
    categorytitle: {
        type: String,
        required: true
    },
    catdescription: {
        type: String,
        required: true
    },
    categoryslug: {
        type: String,
    },
    filepath: {
        type: String,
        trim: true
    },
    filename: {
        type: String
    }
});

let Category = module.exports = mongoose.model('Category', categorySchema);