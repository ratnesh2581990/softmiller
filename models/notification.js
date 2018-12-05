let mongoose = require('mongoose');
var Schema = mongoose.Schema;
let notificationSchema = Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    notificationtime: {
        type: Number,
        required: true
    },
    readflag: {
        type: Number,
        required: true
    },
    userid: {
        type: Schema.Types.ObjectId, ref: 'User'
    }
});

let Notification = module.exports = mongoose.model('Notification', notificationSchema);