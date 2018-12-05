let mongoose = require('mongoose');
let paymentsEntrySchema = mongoose.Schema({
    orderid: {
        type: Number,
        required: true
    },
    bankname: {
        type: String,
        required: true
    },
    neft: {
        type: String,
        required: true
    },
    paymentdate: {
        type: Date,
        required: true,
        default: Date.now
    },
    paymentmiliseconds: {
        type: Number,
        required: true
    },
    transferamount: {
        type: Number,
        required: true
    },
    userid: {
        type: String,
        required: true
    }
});

let Paymentsentry = module.exports = mongoose.model('Paymentsentry', paymentsEntrySchema);