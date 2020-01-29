var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var userSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: true
  },
  last_name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  college: {
     type: String,
     required: true
  },
  phone: {
     type: String,
     required: true 
  },
  city : {
    type : String,
    required : true
  },
  date: {
    type: Date,
    default: Date.now
  },
  referal_from : {
    type: String,
    default: null
  },
  verify : {
    type : Boolean,
    default : false
  },
  link : [{
    type : Number
  }],
  startup : {
    type : Boolean,
    required : true
  },
  esummit_id : {
    type : String
  },
  registration : {
    type : Boolean,
    default : false
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  accomodation : {
    type : String,
    default: null
  },
  type : {
    type: String,
    default: null
  }

})

  userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);