const mongoose = require('mongoose');

// User Schema
const UserSchema = mongoose.Schema({
  name:{
    type: String,
    required: true,
  },
  email:{
    type: String,
    required: true
  },
  station: {
    type: String
  },
  accountnumber: {
    type: Number
  },
  phonenumber:{
    type: Number,
    required: true,
    minlength: 10,
    unique: true,
    trim: true
  },
  password:{
    type: String,
    required: true,
    minlength: 6
  },
  role:{
    type: String,
    required: true
  },
  myreferencecode:{
    type: String,
    required: true
  },
  referedcodeused:{
    type: String
  },
  referalamout:{
    type: Number
  },
  status: {
    type: String
  },
  discountbyrefnumber:{
    type: Number
  }
});

const User = module.exports = mongoose.model('User', UserSchema);
