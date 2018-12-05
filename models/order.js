let mongoose = require('mongoose');
var Schema = mongoose.Schema;
let orderSchema = Schema({
    orderid: {
        type: Number,
        required: true
    },
    customername: {
        type: String,
        required: true
    },
    brokername: {
        type: String,
        required: true
    },
    customernumber: {
        type: Number
    },
    user_id: {
        type: String,
    },
    brokernumber: {
        type: Number
    },
    amount: {
        type: Number,
        required: true
    },
    transportcharge: {
        type: Number,
        required: true
    },
    orderdate: {
        type: Date,
        required: true,
        default: Date.now
    },
    ordermilisecond: {
        type: Number,
        required: true
    },
    walletamountused: {
        type: Number,
        required: true
    },
    ordernote: {
        type: String
    },
    cartobject:{
        type: Array
    },
    userid: {
        type: Schema.Types.ObjectId, ref: 'User',
        required: true
    }
});

let Order = module.exports = mongoose.model('Order', orderSchema);