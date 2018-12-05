let mongoose = require('mongoose');

let brokerSchema = mongoose.Schema({
    type: {
        type: String,
        required: true
    },
    accountnumber: {
        type: Number,
        required: true
    },
    accountname: {
        type: String
    },
    station: {
        type: String
    },
    mobilenumber: {
        type: Number,
        required: true
    },
    emailid: {
        type: String
    }
});

let Broker = module.exports = mongoose.model('Broker', brokerSchema);