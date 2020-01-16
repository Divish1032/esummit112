var express = require("express");
var router = express.Router();
var User = require("../models/User");
var Event = require("../models/events");
var Workshop = require("../models/workshop");
var EventRegister = require("../models/eventRegister");
var WorkshopRegister = require("../models/workshopRegister");
var PaymentDetail = require("../models/paymentDetail");
var Webhook = require("../models/webhook")
var middleware = require('../config');
const refer = require('../security/refer');


// Test Routes

router.get("/tab",  function(req, res) {

    res.render('tab')
});
  
router.get('/ada4545454fe6er6f5ef6f5e', (req, res) => {
User.find({}, (err, result) => {
    if(err)res.send(err);
    else{
    var i = 3456
    result.forEach(x => {
        var eid = "ES-"+ i;
        getAThing(eid, x);
        i++;
    });
    }
    res.send("Success")
})
    
});
async function getAThing(eid, x) {
await User.findOneAndUpdate({email : x.email} ,{$set:{esummit_id : eid}}, (err3, event3) => { 
    if(err3){
    console.log(err3)
    }else{
    console.log("-")
    }
});
}

router.post('/payment-true45454565923dew', (req, res) => {
    User.findOneAndUpdate({esummit_id : req.body.id}, {$set:{ registration : true, accomodation: "yes"}}, (err, result) =>{
        EventRegister.updateMany({student_id: result.email, payment: false} ,{$set:{payment : true}}, (err3, event3) => { 
        res.render("tab")
        });
    })
});

router.get('/payment-history-7887878/fefr96FthrtLK54DMsfe878', (req, res) => {
    User.find({registration : true}, (err, payment) => {
        EventRegister.find({ payment : true }, ( err2, eventPayment) => {
            WorkshopRegister.find({ payment : true}, (err3, workshopPayment) => {
                var result = [];
                payment.forEach(x => {
                    var arr1 = [];
                    var arr2 = [];
                    eventPayment.forEach(y => {
                        if( x.email == y.student_id){
                            arr1.push(y.name);
                        }
                    });
                    workshopPayment.forEach(z => {
                        if( x.email == z.email){
                            arr2.push(z.workshop_name);
                        }
                    });
                    result.push({ ESummit_ID : x.esummit_id, name : x.first_name + " " + x.last_name, phone : x.phone, city : x.city, email : x.email, college : x.college, startup : x.startup, accomodation : x.accomodation, events : arr1, workshops : arr2});
                });
                res.send(result);
            })
        })
    })
});

router.get('/user-historygrtja45rhwe5/g5g4erg5egg545eg4njtj', (req, res) => {
    User.find({}, (err, payment) => {
        EventRegister.find({}, ( err2, eventPayment) => {
            WorkshopRegister.find({}, (err3, workshopPayment) => {
                var result = [];
                payment.forEach(x => {
                    var arr1 = [];
                    var arr2 = [];
                    eventPayment.forEach(y => {
                        if( x.email == y.student_id){
                            arr1.push(y.name);
                        }
                    });
                    workshopPayment.forEach(z => {
                        if( x.email == z.email){
                            arr2.push(z.workshop_name);
                        }
                    });
                    result.push({ ESummit_ID : x.esummit_id, registration : x.registration, name : x.first_name + " " + x.last_name, phone : x.phone, city : x.city, email : x.email, college : x.college, startup : x.startup, accomodation : x.accomodation, events : arr1, workshops : arr2});
                });
                res.send(result);
            })
        })
    })
});


  module.exports = router;