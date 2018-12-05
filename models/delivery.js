let mongoose = require('mongoose');
var Schema = mongoose.Schema;
let deliverySchema = Schema({
    deliveryid: {
        type: Number,
        required: true
    },
    orderid: {
        type: Number,
        required: true
    },
    customernumber: {
        type: Number
    },
    brokernumber: {
        type: Number
    },
    orderdate: {
        type: Date,
    },
    deliverydate: {
        type: Date,
        required: true,
        default: Date.now
    },
    deliverymilisecond: {
        type: Number,
        required: true
    },
    cartobject:{
        type: Array
    },
    paymentflag:{
        type: Number,
        default: 0
    },
    userid: {
        type: Schema.Types.ObjectId, ref: 'User',
        required: true
    }
});

let Delivery = module.exports = mongoose.model('Delivery', deliverySchema);