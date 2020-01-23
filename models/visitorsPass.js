var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
var visitorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email : {
      type : String,
      required : true
  },
  phone: {
      type : String,
      required : true
  },
  payment_id : {
    type : String,
    required: true
  },
  payment_request_id : {
      type : String,
      required: true
  },
  status : {
      type: String,
      required: true
  },
  accomodation: {
    type: Boolean
  }
});

visitorSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("Visitor", visitorSchema);