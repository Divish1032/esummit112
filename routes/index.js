var express = require("express");
var router = express.Router();
var User = require("../models/User");
var Event = require("../models/events");
var Workshop = require("../models/workshop");
var EventRegister = require("../models/eventRegister");
var WorkshopRegister = require("../models/workshopRegister");
var paymentDetail = require("../models/paymentDetail");
var visitorPass = require("../models/visitorsPass")
var webhook = require("../models/webhook")
var middleware = require('../config');
var passport = require("passport");
var bcrypt = require('bcryptjs');
var nodemailer = require("nodemailer");
const keys = require('../security/keys');
const refer = require('../security/refer');
var async = require("async");
var crypto = require("crypto");
var request=require('request');


var Insta = require('instamojo-nodejs');
Insta.setKeys('56cff578f3406493616ced90f2a855c0', 'acdd9b4a9c93ce7825438d2cd4dc56ef')
// Insta.setKeys('test_bb088db45573b736d4c98742fff', 'test_ed12af4b6853090ee92b63e564d')


var smtpTransport = nodemailer.createTransport({
  service: "gmail",
  auth: {
      user: process.env.EMAIL || keys.admin.email,
      pass: process.env.PASSWORD  ||keys.admin.password
  }
});
var rand, link;



// Landing Page

router.get('/', (req,res) => {
  res.render("index", {user : req.user});
});


// Payment
router.get('/payment', middleware.ensureAuthenticated, (req, res) => {

  res.render('payment', {user: req.user});
})

router.post('/payment', middleware.ensureAuthenticated, (req, res) => {
  var amount = parseInt(req.body.amount);
  var total = 0;
  var visit = false;
  if(amount == 1){
    total= 999;
    instaPayment(total, req, res, visit)
  }
  else if(amount == 3){
    total= 999;
    instaPayment(total, req, res, visit)
  }
  else if(amount == 4){
    total= 7499;
    WorkshopRegister.find({email: req.user.email, workshop_id: "5dfd36336dea263d7cec0444"}, (errr, wkp) =>{
      if(errr)res.send(errr);
      else{
        if(wkp.length !=0){
          instaPayment(total, req, res, visit)
        }
        else{
          req.flash('error_msg', "You have not registered this workshop yet in participate tab.");
          res.redirect('/dashboard?type=workshop');
        }
      }
    });
  }
  else if(amount == 5){
    total= 2499;
    EventRegister.find({student_id: req.user.email, name: "E-Carnival"}, (errr, evt) =>{
      if(errr)res.send(errr);
      else{
        if(evt.length !=0){
          instaPayment(total, req, res, visit)
        }
        else{
          req.flash('error_msg', "You have not participated in E-Carnival yet.");
          res.redirect('/dashboard?type=startup');
        }
      }
    });
  }
  else if(amount == 6){
    total= 800;
    visit = true;
    instaPayment(total, req, res, visit)
  }
  else if(amount == 7){
    total= 300;
    visit = true;
    instaPayment(total, req, res, visit)
  }


  
});

function instaPayment(total, req, res, visit) {
  var data = new Insta.PaymentData();
  data.purpose = "E-Summit 2020 IIT(BHU) Varanasi: "+ req.user.esummit_id;            // REQUIRED
  data.amount = total;
  data.currency                = 'INR';
  data.buyer_name              = req.user.first_name;
  data.email                   = req.user.email;
  data.phone                   = req.user.phone;
  /* data.webhook                 = 'https://esummitiitbhu.com/payment-webhook-14567899' */
  data.send_sms                = 'True';
  data.send_email              = 'True';
  data.allow_repeated_payments = 'True';                  
  data.setRedirectUrl('https://esummitiitbhu.com/pay789456');
    
  Insta.createPayment(data, function(error, response) {
    if (error) {
      // some error
    } else {
      response = JSON.parse(response);
      // Payment redirection link at response.payment_request.longurl
      if(response.success == false){
        if(response.message.phone){
          req.flash('error_msg', response.message.phone[0]);
          res.redirect('/payment?type=payment');
        }
        else if(response.message.email){
          req.flash('error_msg', response.message.email[0]);
          res.redirect('/payment?type=payment');
        }
        else{
          req.flash('error_msg', "Error Occured");
          res.redirect('/payment?type=payment');
        }
      }
      else{  
        console.log(visit)
        if(!visit){
          User.findOneAndUpdate({email: req.user.email}, {$set:{ accomodation : req.body.accomodation}}, (err, result)=>{
            if(err)res.send(err);
            else{
              res.redirect(response.payment_request.longurl);
            }
          });
        }
        else{
          User.findOneAndUpdate({email: req.user.email}, {$set:{ accomodation : null}}, (err, result)=>{
            if(err)res.send(err);
            else{
              res.redirect(response.payment_request.longurl);
            }
          });
        }                      
        
      }
    }
  });
}

router.get('/pay789456', middleware.ensureAuthenticated, (req, res)=>{
  var payment_id = req.query.payment_id;
  var payment_request_id = req.query.payment_request_id;
  var status = req.query.payment_status;
  var email = req.user.email;
  var name = req.user.first_name;
  var phone = req.user.phone;
  var newPaymentDetail = new paymentDetail({ email, name, payment_id, payment_request_id, status});
  newPaymentDetail.save((err, rest)=>{
    if(err)res.send(err)
    else{
      if(status == "Credit"){
        Insta.getPaymentDetails(payment_request_id, payment_id, function(error, body) {
          if (error) {
            res.send(error)
          } 
          else {
            var amount = parseInt(body.payment_request.payment.unit_price);
            if(amount == 999){
              User.findOneAndUpdate({email : email}, {$set:{registration : true}}, (err, reuslt) =>{
                if(err)res.send("Error");
                else{
                  EventRegister.updateMany({student_id: email, payment: false, name: { $ne: "E-Carnival" }} ,{$set:{payment : true}}, (err2, result2) => { 
                    if(err2)res.send("Error2")
                    else{
                      WorkshopRegister.updateMany({email: email, payment: false, workshop_id: { $ne: "5dfd36336dea263d7cec0444" }} ,{$set:{payment : true}}, (err3, event3) => { 
                        if(err3)res.send("Error3")
                        else{
                          req.flash('success_msg','Payment Success for registration');
                          res.redirect('/dashboard-participate');
                        }
                      })
                    }
                  })
                }
              });
            }
            else if(amount == 2499){
              EventRegister.findOneAndUpdate({student_id: email, name: "E-Carnival"} ,{$set:{payment : true}}, (err2, result2) => { 
                if(err2)res.send("Error2")
                else{
                  req.flash('success_msg','Payment Success for E-Carnival');
                  res.redirect('/dashboard-participate');
                }
              })
            }
            else if(amount == 7499){
              WorkshopRegister.updateMany({email: email, workshop_id: "5dfd36336dea263d7cec0444" } ,{$set:{payment : true}}, (err3, event3) => {
                if(err3)res.send("Error2")
                else{
                  req.flash('success_msg','Payment Success for KPMG Workshop');
                  res.redirect('/dashboard-participate');
                }
              })
            }
            else if(amount == 800){
              var newVisitorPass = new visitorPass({ name, email, phone, payment_id, payment_request_id, status, accomodation: true});
              newVisitorPass.save((err, rest)=>{
                if(err)res.send(err)
                else{
                  req.flash('success_msg','Payment Success for Visitors Pass');
                  res.redirect('/dashboard-participate');
                }
              });
            }
            else if(amount == 300){
              var newVisitorPass = new visitorPass({ name, email, phone, payment_id, payment_request_id, status, accomodation: false});
              newVisitorPass.save((err, rest)=>{
                if(err)res.send(err)
                else{
                  req.flash('success_msg','Payment Success for Visitors Pass');
                  res.redirect('/dashboard-participate');
                }
              });
            }
          }
        });
      }
      else{
        req.flash('error_msg','Payment Failed');
        res.redirect('/dashboard-participate');
      }
    }
  });
});

router.post('/payment-webhook-14567899', (req, res) => {
  var email = req.body.buyer;
  var amount = req.body.amount;
  var name = req.body.buyer_name;
  var payment_id = req.body.payment_id;
  var payment_request_id = req.body.payment_request_id;
  var status = req.body.status;

 
  if(status == "Failed"){
    User.findOneAndUpdate({email: req.user.email}, {$set:{ accomodation : null}}, (err10, result10)=>{
      if(err10)res.send(err10);
      else{
        var webhookdetail = new webhook({amount, email, name, payment_id, payment_request_id, status});
        webhookdetail.save().then(newE => {
          res.send("Success")
        })
      }
    })
  }
  else{
    User.findOneAndUpdate({email: req.user.email}, {$set:{ registration: true}}, (err10, result10)=>{
      if(err10)res.send(err10);
      else{
        var webhookdetail = new webhook({amount, email, name, payment_id, payment_request_id, status});
        webhookdetail.save().then(newE => {
          res.send("Success")
        })
      }
    })
  }
})

// Dashboard

router.get('/dashboard', middleware.ensureAuthenticated , (req,res) => {
  Event.find({}, (err, events) => {
    if(err){
      res.send({error : "Error Occured due to events"})
    }
    else{
      dup =events
      dup2 =[]
      EventRegister.find({student_id : req.user.email} , (err , doc1) => {
        var flag = 0
        dup.forEach(x => {
          doc1.forEach(y => {
            if( x._id == y.event_id){
              flag = 1;
            }
          });
          if(flag == 0)dup2.push(x);
          else flag = 0;
        });
        events = dup2;
        Workshop.find({}, (err2, workshops) => {
          if(err2){
            res.send({error : "Error Occured due to workshops"})
          }
          else{

            EventRegister.find({ student_id : req.user.email}, (err3, result4) => {
              
              EventRegister.find({ leader_id : req.user.email}, (err3, result5) => {
              res.render("dashboard", { user : req.user, events : events, registeredEvents : result4, workshops : workshops, leaderEvents : result5, type: req.query.type});
            })
            
          })
        }
        })
      })
    }
  })
});

router.get('/dashboard-participate', middleware.ensureAuthenticated , (req,res) => {  

  EventRegister.find({ student_id : req.user.email}, (err, result) => {
    if(err)res.send("Error");
    else{
      WorkshopRegister.find({email : req.user.email}, (err4, result4) => {
        if(err4)res.send("Error");
        else{
          if(result.length > 0){
            arr =[]
            var len = result.length;
            var i=1;
            result.forEach(a => {
              EventRegister.find({ team_name : a.team_name, name: a.name, leader_id : a.leader_id}, (err2, result2) => {
                if(err2)res.send("Error2");
                else{
                  arr.push({ team_name : a.team_name, data : result2 });
                }
                if(i==len){
                  
                      res.render("participate", { user : req.user, registeredEvents : result, allteam : arr, registeredWorkshops : result4 });
                    
                  
                }
                i++;
              });
            })
          }
          else{
            res.render("participate", { user : req.user, registeredEvents : result, allteam : [], registeredWorkshops : result4  });
          }
        }
      })
     
    }
  })
});

router.post('/dashboard/event', middleware.ensureAuthenticated , (req,res) => {
  var event_id = req.body.id;
  var name = null;
  var leader_id = req.user.email;
  var student_id = req.user.email;
  var status = true;
  var team_name = req.body.team_name;
  Event.findOne({_id : event_id}, (err, result) => {
    name = result.name;
    var payment = (req.user.registration && result.name!= "E-Carnival") ? true : false;
    var newEventRegister = new EventRegister({ event_id, name, team_name, leader_id, student_id, status, payment: payment});
    newEventRegister.save().then(newEvent => {
      req.flash('success_msg','You have registered this event');
      res.redirect('/dashboard-participate');
      });
  });
});

router.post('/dashboard/workshop', middleware.ensureAuthenticated , (req,res) => {
  var workshop_id = req.body.id;
  var workshop_name = null;
  var email = req.user.email;
  var name = req.user.first_name + req.user.last_name;

  WorkshopRegister.findOne({email : email, workshop_id : workshop_id}, (err, result) => {
    if(!result){
      Workshop.findById(workshop_id, (er, rr) =>{
        if(er)res.send("Error");
        else{
          workshop_name = rr.name;
          var payment = (req.user.registration && workshop_id != "5dfd36336dea263d7cec0444" && !req.user.startup) ? true : false; 
          var newWorkshopRegister = new WorkshopRegister({ workshop_id, workshop_name, name, email, payment});
          newWorkshopRegister.save().then(newWorkshopRegister => {
            req.flash('success_msg','You have registered this workshop');
            res.redirect('/dashboard-participate#workshop');
            })
        }
      })
    }
    else{
      req.flash('error_msg','You have already registered that workshop.');
      res.redirect('/dashboard-participate');
    }
    
  })
});

router.post('/dashboard/add-member-event/:id/:team_name/:name', middleware.ensureAuthenticated , (req,res) => {
  var event_id = req.params.id;
  var leader_id = req.user.email;
  var student_id = req.body.email;
  var team_name = req.params.team_name;
  var name = req.params.name;
  if(student_id != req.user.email){
    EventRegister.find({ name : name, student_id : student_id}, (err8, result8) => {
      if(result8.length ==0){
        EventRegister.find({ team_name : team_name, name : name}, (error, result2) => {
          if(error)res.send("Error");
          else{
            if(result2.length >=4){
              req.flash('error_msg','You can add upto 4 members only.');
              res.redirect('/dashboard-participate');
            }
            else{
              var flag = 0;
              result2.forEach(x => {
                if(x.student_id == student_id){
                  flag = 1;
                  req.flash('error_msg','You have already added this member.');
                  res.redirect('/dashboard-participate');
                }
              });
              if(flag == 0){
                Event.findOne({_id : event_id}, (err, result5) => {
                  name = result5.name;
                  student = result5.student;
                  User.findOne({email : student_id}, (err, result) => {
                    if(err)res.send("Error")
                    else {
                      if(result){
                        
                          var payment = (result.registration && result5.name!= "E-Carnival") ? true : false;
                          var newEventRegister = new EventRegister({ event_id, team_name, name, leader_id, student_id, payment : payment});
                          newEventRegister.save().then(newEvent => {
                            req.flash('success_msg','You have added a member.');
                            res.redirect('/dashboard-participate');
                            })
                        
                      }
                      else{
                        req.flash('error_msg','This person has not registered on Esummit yet!');
                        res.redirect('/dashboard-participate');
                      }
                    }
                  })
                });
              }
            }
          }
        }); 
      }
      else{
        req.flash('error_msg','This person has already registered this event.');
        res.redirect('/dashboard-participate');
      }
    });
  }
  else{
    req.flash('error_msg','You cannot add yourself.');
    res.redirect('/dashboard-participate');
  }
});

router.get('/dashboard/accept-event/:id', middleware.ensureAuthenticated , (req,res) => {
  var event_register_id = req.params.id;
  EventRegister.findOne({_id : event_register_id }, (err, event) => {
    if(err){
      res.send({error : "Error Occured due to accpetance"})
    }
    else{
      if(event.student_id == req.user.email){
        EventRegister.findOneAndUpdate({_id : event_register_id }, {$set:{status : true}}, (err, event) => {
          if(err){
            res.send({error : "Error Occured due to acceptance up"})
          }
          else{
                req.flash('success_msg','You have accpeted the event');
                res.redirect('/dashboard-participate');
          }
        })
      }
      else{
            req.flash('success_msg','Event cannot be accepted');
            res.redirect('/dashboard');
      }
    }
  });
});

router.get('/dashboard/reject-event/:id', middleware.ensureAuthenticated , (req,res) => {
  var event_register_id = req.params.id;
  EventRegister.findOne({_id : event_register_id }, (err, event) => {
    if(err){
      res.send({error : "Error Occured due to deletion"})
    }
    else{
      if(event.student_id == req.user.email || event.leader_id == req.user.email){
        EventRegister.findByIdAndRemove({_id : event_register_id }, (err, event) => {
          if(err){
            res.send({error : "Error Occured due to deletion"})
          }
          else{
                req.flash('success_msg','You have rejected the event');
                res.redirect('/dashboard-participate');
          }
        })
      }
      else{
            req.flash('success_msg','Event cannot be rejected');
            res.redirect('/dashboard');
      }
    }
  });
});

router.get('/dashboard/reject-workshop/:id', middleware.ensureAuthenticated , (req,res) => {
  var event_register_id = req.params.id;
  WorkshopRegister.findByIdAndRemove({_id : event_register_id }, (err, event) => {
    if(err){
      res.send({error : "Error Occured due to deletion"})
    }
    else{
          req.flash('success_msg','You have deleted the workshop');
          res.redirect('/dashboard-participate');
    }
  })
});

router.get('/dashboard/discard-event/:team_name/:name', middleware.ensureAuthenticated , (req,res) => {
  var team_name = req.params.team_name;
  var name = req.params.name;
  EventRegister.deleteMany({leader_id : req.user.email, name: name , team_name : team_name }, (err, rest) => {
    req.flash('success_msg','You have deleted the event');
    res.redirect('/dashboard-participate');
  })
});


// Authentication

router.get('/register', middleware.forwardAuthenticated, (req,res) => {
  res.render("register");
});

router.get('/login', middleware.forwardAuthenticated, (req,res) => {
  res.render("login");
});

router.get('/send', middleware.checkEmailVerification, middleware.ensureAuthenticated, (req, res) => {
  rand=Math.floor((Math.random() * 100000) + 54);
  link="https://"+req.get('host')+"/verify?id="+rand+"&email="+req.user.email;
  arr = []
  User.findOne({email: req.user.email}, (err, user)=> {
    if(err){
      req.flash('error_msg','Email not found');
      res.redirect('/dashboard');
    }
    else{
      arr = user.link;
      arr.push(rand)
      User.findOneAndUpdate({email: req.user.email}, {$set:{link:arr}}, (err, resu) => {
        if(err){
          req.flash('error_msg','Could Not update Link in Database');
          res.redirect('/dashboard');
        }
        else{
          let mailOptions={
            from: keys.admin.from_email,
            to : req.user.email,
            subject : "Please confirm your Email account",
            html : "<h4 style='text-align:center'>Email Verification </h4> <br>Hello,<br> Please Click on the link to verify your email.<br><a href="+link+">Click here to verify</a><br> <p>P.S. If you have received this mail multiple time then please click the most recent mail and in that click verify email.</p>"	
          }
          smtpTransport.sendMail(mailOptions, function(error, response){
            if(error){
              req.flash('error_msg','Could Not Send Mail');
              res.redirect('/dashboard');
            }
            else{
                req.flash('success_msg','Email Sent Successfuly');
                res.redirect('/dashboard');
            }
          });
        }
      })
    }
  });
});

router.get('/verify', function(req,res){
  var currentID = req.query.id;
  var trueID = null;
  var allID = null;
 User.findOne({email: req.query.email}, (err1, result) => {
   
   if(err1){res.send("Something went wrong, email not found")}
   else{
    if(result.verify == false){
      trueID = result.link[result.link.length-1];
      allID = result.link;
      if(currentID == trueID)
      {
         User.findOneAndUpdate({email: req.query.email}, {$set:{verify:true}}, (err3, doc) => {
           if (err3) {  
               res.send("Something went wrong, please re-verify your email")
           }
           else{
             res.send("Email is verified, please close this tab and refresh the previous tab of the dashboard.")
           }
         })
      }
      else
      {
        flag = 0;
        allID.forEach(x => {
          if(x == currentID){
           flag = 1;
           res.send("This is an experied link please clicked the latest one");
          }
        });
        if(flag == 0){
         res.send("This is a wrong link");
        }
      }
    }
    else{
      res.send("Email already verified");
    }
   }
 
 })
});

router.post('/register', (req, res) => {
    const first_name = req.body.first_name;
    const last_name = req.body.last_name
    const email = req.body.email;
    const password = req.body.password;
    const password2 = req.body.password2;
    const phone = req.body.phone;
    const college = req.body.college;
    const city = req.body.city;
    var startup = req.body.startup;
    if(startup == "1")startup = true;
    else startup = false;
    const referal_from = req.body.referal_from || null;
    let errors = [];
    if (password != password2) {
      errors.push({ msg: 'Passwords do not match' });
    }
    if (password.length < 6) {
      errors.push({ msg: 'Password must be at least 6 characters' });
    }
    if (errors.length > 0) {
      res.render('register', { errors, email, password  });
    }
    else {
      var flag =0;
      if(referal_from !=null){
        request.get('http://ca-ecell.herokuapp.com/qwyuidhjwdhjdw', function(err2, res2, body){
          if(err2){
            res.send(err2)
          }
          else{
            body = JSON.parse(body);
            body.forEach(x => {
              if(x.referal_code == referal_from){
                flag =1;
                User.findOne({ email: email }).then(user => {
                  if (user) {
                    errors.push({ msg: 'Email already exists' });
                    res.render('register', { errors, email, password });
                  } 
                  else {
                    User.find().sort({esummit_id: -1}).limit(1).then(ff =>{
                      var esummit_id = ff[0].esummit_id;
                      esummit_id = parseInt(esummit_id.substring(3,7));
                      esummit_id = esummit_id + 1;
                      esummit_id = "ES-" + esummit_id;                  
                      var newUser = new User({ first_name, last_name, email, password, phone, college, city, referal_from,  startup, esummit_id});
                      bcrypt.genSalt(10, (err, salt) => {
                      bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;
                        newUser.password = hash;
                        newUser.save().then(user => {
                          req.flash('success_msg','You are now registered and can log in');
                          res.redirect('/login');
                          })
                          .catch(err => console.log(err));
                      })    
                    })
                    })
                    
                  }
                })
              }
            });
            if(flag ==0){
              errors.push({ msg: 'Invalid Referal Code' });
              res.render('register', { errors, email, password });
            }
          }
        });
      }
      else{
        User.findOne({ email: email }).then(user => {
          if (user) {
            errors.push({ msg: 'Email already exists' });
            res.render('register', { errors, email, password });
          } 
          else {
            User.find().sort({esummit_id: -1}).limit(1).then(ff =>{
              var esummit_id = ff[0].esummit_id;
              esummit_id = parseInt(esummit_id.substring(3,7));
              esummit_id = esummit_id + 1;
              esummit_id = "ES-" + esummit_id;  
              var newUser = new User({ first_name, last_name, email, password, phone, college, city, referal_from, startup, esummit_id });
              bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                  if (err) throw err;
                  newUser.password = hash;
                  newUser.save().then(user => {
                    req.flash('success_msg','You are now registered and can log in');
                    res.redirect('/login');
                    })
                    .catch(err => console.log(err));
                })    
              })
            })
          }
        })
      }
    }
  });

router.post('/referal-submit', (req, res) => {
  var code = req.body.code;
  var flag= 0;
  if(code !=null){
    request.get('http://ca-ecell.herokuapp.com/qwyuidhjwdhjdw', function(err2, res2, body){
      if(err2){
        res.send(err2)
      }
      else{
        body = JSON.parse(body);
        body.forEach(x => {
          if(x.referal_code == code){
            flag= 1;
            User.findOneAndUpdate({email: req.user.email}, {$set:{referal_from : code}}, (err, result) =>{
              if(err)res.send(err);
              else{
                req.flash('success_msg','Referal Completed');
                res.redirect('/dashboard?type=profile');
              }
            });
          }
        });
        if(flag === 0){
          req.flash('error_msg','Invalid Referal Code');
          res.redirect('/dashboard?type=profile');
        }
      }
    })
    
  }
  else{
    req.flash('error_msg','Referal Code Empty');
    res.redirect('/dashboard?type=profile');
  }

})

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
      successRedirect: '/dashboard?type=profile',
      failureRedirect: '/login',
      failureFlash: true,
      successFlash: true,
      successMessage: "Yoyo"
    })(req, res, next);
  });

router.get("/logout",  function(req, res) {
  req.logout(); 
  req.flash('success_msg','Successfully logged out');
  res.redirect('/');
});


// forgot password
router.get('/forgot', function(req, res) {
  res.render('forgot');
});

router.post('/forgot', function(req, res, next) {
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({ email: req.body.email }, function(err, user) {
        if (!user) {
          req.flash('error_msg', 'No account with that email address exists.');
          return res.redirect('/forgot');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      
      var mailOptions = {
        to: user.email,
        from: keys.admin.from_email,
        subject: 'Esummit-20 Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset?token=' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        console.log('mail sent');
        req.flash('success_msg', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/forgot');
  });
});

router.get('/reset', function(req, res) {
  User.findOne({ resetPasswordToken: req.query.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      req.flash('error_msg', 'Password reset token is invalid or has expired.');
      return res.redirect('/forgot');
    }
    res.render('reset', {token: req.query.token});
  });
});

router.post('/reset/:token', function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          req.flash('error_msg', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }
        if(req.body.password === req.body.confirm) {

          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(req.body.password, salt, (err, hash) => {
              if (err) throw err;
              var password = hash;
              User.findOneAndUpdate({email: user.email}, {$set:{password: password}}, (err3, doc) => {
                user.resetPasswordToken = undefined;
                user.resetPasswordExpires = undefined;
                user.save(function(err) {
                  req.logIn(user, function(err) {
                    done(err, user);
                  });
                });
                })
            })    
          })
        
        } else {
            req.flash("error_msg", "Passwords do not match.");
            return res.redirect('back');
        }
      });
    },
    function(user, done) {
      
      var mailOptions = {
        to: user.email,
        from: keys.admin.from_email,
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('success_msg', 'Success! Your password has been changed.');
        done(err);
      });
    }
  ], function(err) {
    res.redirect('/dashboard?type=profile');
  });
});


 module.exports = router;