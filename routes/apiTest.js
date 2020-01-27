var express = require("express");
var router = express.Router();
var User = require("../models/User");
var Event = require("../models/events");
var Workshop = require("../models/workshop");
var EventRegister = require("../models/eventRegister");
var WorkshopRegister = require("../models/workshopRegister");
var visitorPass = require("../models/visitorsPass")
var PaymentDetail = require("../models/paymentDetail");
var Webhook = require("../models/webhook")
var middleware = require('../config');
const refer = require('../security/refer');
var nodemailer = require("nodemailer");
const keys = require('../security/keys');
var Insta = require('instamojo-nodejs');
Insta.setKeys('56cff578f3406493616ced90f2a855c0', 'acdd9b4a9c93ce7825438d2cd4dc56ef')
// Insta.setKeys('test_bb088db45573b736d4c98742fff', 'test_ed12af4b6853090ee92b63e564d')


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

router.post('/payment999-true45454565923dew', (req, res) => {
    
    User.findOneAndUpdate({esummit_id : req.body.id}, {$set:{registration : true}}, (err, user) =>{
        if(err)res.send("Error");
        else{
          EventRegister.updateMany({student_id: user.email, payment: false, name: { $ne: "E-Carnival" }} ,{$set:{payment : true}}, (err2, result2) => { 
            if(err2)res.send("Error2")
            else{
              WorkshopRegister.updateMany({email: user.email, payment: false, workshop_id: { $ne: "5dfd36336dea263d7cec0444" }} ,{$set:{payment : true}}, (err3, event3) => { 
                if(err3)res.send("Error3")
                else{
                  req.flash('success_msg','Payment Success for registration');
                  res.redirect('/test/tab');
                }
              })
            }
          })
        }
      });
    
});

router.post('/payment2500-true45454565923dew', (req, res) => {
    
    User.findOneAndUpdate({esummit_id : req.body.id}, {$set:{registration : true}}, (err, result) =>{
        if(err)res.send("Error");
        else{
          EventRegister.findOneAndUpdate({student_id: result.email} ,{$set:{payment : true}}, (err2, result2) => { 
            if(err2)res.send("Error2")
            else{
              res.redirect('/test/tab');
            }
          })
        }
      });
    
});


router.get('/payment-history-7887878/fefr96FthrtLK54DMsfe878', (req, res) => {

    Insta.getAllPaymentRequests(function(error, response) {
        if (error) {
          res.send(error)
        } else {
          User.find({registration : true}, (err, payment) => {
            EventRegister.find({ payment : true }, ( err2, eventPayment) => {
                WorkshopRegister.find({ payment : true}, (err3, workshopPayment) => {
                    var result = [];
                    payment.forEach(x => {
                        var arr1 = [];
                        var arr2 = [];
                        var price;
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
                        response.payment_requests.forEach(p => {
                            if(p.status == "Completed" && x.email == p.email){
                                price = p.amount;
                            }
                        });
                        result.push({ ESummit_ID : x.esummit_id, name : x.first_name + " " + x.last_name, phone : x.phone, city : x.city, email : x.email, college : x.college, startup : x.startup, accomodation : x.accomodation, events : arr1, workshops : arr2, amount : price});
                    });
                    
                    res.send(result);
                })
            })
        })
        }
      });
    
});

// Workshop Data
router.get('/workshopregister-history-feFr6fe/gthERNgtaxxm', (req, res) => {
    User.find({}, (err, user) => {
        WorkshopRegister.find({}, (err3, workshop) => {
            var result = [];
            user.forEach(x => {
                workshop.forEach(y => {
                    if( x.email == y.email){
                        result.push({ ESummit_ID : x.esummit_id, name : x.first_name + " " + x.last_name, phone : x.phone, email : x.email, workshops : y.workshop_name, payment: y.payment});
                    }
                });
            });
            res.send(result);
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

router.get('/visitor-historygrtja45rhwe5/g5gKLY56WRE', (req, res) => {
    visitorPass.find({}, (err, visitor) =>{
        var result =[];
        visitor.forEach(x => {
            var price = x.accomodation ? 500 : 300
            result.push({name: x.name, email: x.email, phone: x.phone, accomodation: x.accomodation, price : price})
        });
        res.send(result);
    })
});

// Events Data
router.get('/eventregister-history-frukLppPw86CVnnbN/test546s6dDGHJWSx', (req, res) => {
    User.find({}, (err, user) => {
        EventRegister.find({}, (err3, event) => {
            var result = [];
            user.forEach(x => {
                event.forEach(y => {
                    if( x.email == y.student_id){
                        result.push({ ESummit_ID : x.esummit_id, name : x.first_name + " " + x.last_name, phone : x.phone, email : x.email, event : y.name, team_name: y.team_name, payment: y.payment});
                    }
                });
            });
            res.send(result);
        })
    })
});


router.get('/workshop-deletehgj54/36nfgGHHg', (req, res) => {
    WorkshopRegister.deleteMany({workshop_id : "5dfd36336dea263d7cec0444"}, (err3, workshop) => {
        res.send("success")
    })
});

router.get('/workshop-entry565ferf', (req, res) => {
    var workshop = new Workshop({name: "A Story To Tell by Dhruv Sehgal", price : 0});
    workshop.save().then(wk => {
        res.send("true");
    })
});




  module.exports = router;