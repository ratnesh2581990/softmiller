let mongoose = require('mongoose');
let rateupdateSchema = mongoose.Schema({
    ratechangedate: {
        type: String,
        required: true
    },
    productbrandprices: {
        type: Array,
        required: true
    }
});

let Rateupdate = module.exports = mongoose.model('Rateupdate', rateupdateSchema);