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
var nodemailer = require("nodemailer");
const keys = require('../security/keys');

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

var smtpTransport = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL || keys.admin.email,
        pass: process.env.PASSWORD  ||keys.admin.password
    }
  });

router.get('/emailbulk4FHJds4699', (req, res) => {
    //anujhooda007@gmail.com
    var emails = [['raji@instafinancials.com'], ['info@saboori.org'], ['info@taxtellers.com'], ['sanjeev@casaxprt.com'], ['sundeepg93@gmail.com'], ['sandeepnarayan.iitr8@gmail.com'], ['kesavaramd@sanohub.com'], ['sarang.didmishe@flowkraft.co.in'], ['cp.matar@gmail.com'], ['jasminkshaikh@axiafood.com']];
    app1(emails);
    res.send("Success");
});

async function operation(emails) {
    return new Promise(function(resolve, reject) {
        var a = 0;
        var b = 1;
        a = a + b;
        a = 5;
        var i=1;

        emails.forEach(x => {
            var mailOptions = {
                bcc: x[0],
                from: keys.admin.from_email,
                subject: 'Invitation to Participate in Entrepreneurship Summit IIT BHU',
                html: "<p>Respected Sir/Maam,</p>" +
                    "<p>It gives us immense pleasure to announce that the Indian Institute of Technology (Banaras Hindu University) Varanasi is organising <b>The Entrepreneurial festival of IIT(BHU), on the 1st and 2nd of February 2020 in our campus.</b> I would like to describe other opportunities of the summit:<p>"+
                    "<p style='text-decoration:underline'><b>1.Lonewolf challenge</b></p>"+
                    "<p>Startups would be pitching to a pool of investors to get investment. We are inviting startups, looking for funding, to register for this event. The investor panel who have been <b>fully confirmed</b> have been attached.</p>"+
                    "<p style='text-decoration:underline'><b>2. Speed dating an investor on a boat</b></p>"+
                    "<p>Startups would go on a 10 minute boat ride with the investors/mentors. This would be an informal interaction in which the investor/mentor would provide feedback to the startup at the end of the boat ride.</p>"+
                    "<p style='text-decoration:underline'><b>3. Startup Expo (E-Carnival)</b></p>"+
                    "<p>The startups would be showcasing their product/service to the humongous footfall of the entrepreneurship summit. Each startup would be allocated <b>a stall space of 10ft x 10ft.</b> and they are free to <b>distribute their pamphlet</b> to reach out to prospective clients.<b> Investors would also visit the stalls in a particular time slot. 3 startup stalls would also get direct entry to the final round of iB Hubs Startup School.</p></b>"+
                    "<p style='text-decoration:underline'><b>4. Intern Connect</b></p>"+
                    "<p>We are inviting startups to share internship openings in their startups which would be listed on our portal. Interviews could be conducted telephonically by the startup. I would request you to share the internship details at the earliest so that we can upload it on the portal. The internships can be remote. All internship would be uploaded free of cost.<b style='text-decoration:underline'> Please reply to this email with your internship opening.</p></b><br>"+
                    "<p><b>Date : Feb 1,2 2020<b/></p>"+
                    "<p>Website: <a href='https://esummitiitbhu.com/'> E-Summit'2020</a></p>"+
                    "<p><b>You need to register on our website by 30th January to participate.</b></p><br>"+
                    "<p>Please feel free to contact me if you have any queries.</p>"+
                    "<p style='font-size:18px;'><a href='https://drive.google.com/file/d/1VEuox3KBfzVF7wRQ5pW6Mefu8tKGx_G0/view?usp=sharing'>Click here to see the brochure</a></p>"+
                    "<p style='font-size:18px;'><a href='https://drive.google.com/file/d/1vmfnSHhaxF7QDGIQw3g_MMhn0n0-8Aar/view?usp=sharing'>Click here to see the investor list</a></p><br>"+
                    "<p>Thanks and Regards,</p>"+
                    "<p>Shashwat Agarwal</p>"+
                    "<p>Startup Assistance Program Head,</p>"+
                    "<p>E-Cell IIT BHU,</p>"+
                    "<p>+91-7235046951</p>"
            };
            smtpTransport.sendMail(mailOptions, function(err) {
                if(err)
                console.log(err + i);
                else
                console.log("Yup-" + i);
                i++;
            });
        });
        resolve(a) // successfully fill promise
    })
}

async function app1(emails) {
    var a = await operation(emails) // a is 5
}



  module.exports = router;