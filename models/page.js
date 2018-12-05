let mongoose = require('mongoose');

let pageSchema = mongoose.Schema({
    pagetitle: {
        type: String,
        required: true
    },
    pagebody: {
        type: String,
        required: true
    },
    creationdate: {
        type: Number,
        required: true
    },
    modifieddate: {
        type: Number
    }
});

let Page = module.exports = mongoose.model('Page', pageSchema);