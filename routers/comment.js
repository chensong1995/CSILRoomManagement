/*
 * Author(s)  : Ruiming Jia, Chen Song
 * Description: This file handles feedback from users.
 * Last Update: July 22, 2017
*/

////////////////////////////////////////////////////////
// External dependencies
// 1. Express framework
var express = require('express');
var router = express.Router();
// 2. csurf protection
var csurf = require('csurf'); 
var csrfProtection = csurf({ cookie: true });
////////////////////////////////////////////////////////
var nodemailer = require('nodemailer');
router.use(csrfProtection);

/*
 * Author(s)  : Ruiming Jia, Chen Song
 * Description: This function sends the feedback page
 * Last Update: July 22, 2017
*/
router.get('/', function (req, res) {
    // prepare all view variables
    var username = req.userDisplay.username;
    var source = req.userDisplay.type == 'other' ? 'CSIL Account' : 'SFU Central Authentication Service';
    var allowAdmin = req.userDisplay.allowAdmin;
    var page = "Report Violations Send Feedback";
    // Jia, I fixed the rendering issue here. -- Chen Song
    res.render('comment', {
        username: username,
        source: source,
        allowAdmin: allowAdmin,
        page: page,
        message: req.body.message,
        csrfToken: req.csrfToken()
    });
});

/*
 * Author(s)  : Ruiming Jia
 * Description: This function sends the feedback-view page
 * Last Update: July 22, 2017
*/
router.get('/view', function (req, res) {
    // prepare all view variables
    var username = req.userDisplay.username;
    var source = req.userDisplay.type == 'other' ? 'CSIL Account' : 'SFU Central Authentication Service';
    var allowAdmin = req.userDisplay.allowAdmin;
    var page = "Report Violations View Feedback";
    if (!allowAdmin) {
        var feedbacks = [];
        //fetch previous feedback from database
        req.models.Feedback.find({username: req.userDisplay.username}, function (err, results) {
            if (err) {
                res.sendStatus(500); // internal server error
            } else {
                for (var i = 0; i < results.length; i++) {
                    feedbacks.push({
                        username: results[i].username,
                        message: results[i].message,
                        time: results[i].time.toLocaleString(undefined, {timeZone: 'America/Vancouver'})
                    });
                }
                // Jia, I fixed the rendering issue here. -- Chen Song
                res.render('comment-view', {
                    username: username,
                    source: source,
                    allowAdmin: allowAdmin,
                    page: page,
                    feedbacks: feedbacks,
                    csrfToken: req.csrfToken()
                });
            }
        });
    }
    else { //admin page
        var feedbacks = [];
        //fetch all feedbacks from database
        req.models.Feedback.find({sendByAdmin: 0}, function (err, results) {
            if (err) {
                res.sendStatus(500); // internal server error
            } else {
                for (var i = 0; i < results.length; i++) {
                    feedbacks.push({
                        username: results[i].username,
                        message: results[i].message,
                        time: results[i].time.toLocaleString(undefined, {timeZone: 'America/Vancouver'}),
                        path: '/comment/' + results[i].id
                    });
                }
                res.render('admin-comment-view', {
                    username: username,
                    source: source,
                    allowAdmin: allowAdmin,
                    page : "View Feedback",
                    feedbacks: feedbacks,
                    csrfToken: req.csrfToken()
                });
            }
        });

    }
});

/*
 * Author(s)  : Ruiming Jia, Chen Song
 * Description: This function allows users to send feedback
 * Last Update: July 22, 2017
*/

router.post('/', csrfProtection, function (req, res) {
    var message = req.body.message;
    var username = req.userDisplay.username;
    var email = req.userDisplay.email;
    var source = req.userDisplay.type == 'other' ? 'CSIL Account' : 'SFU Central Authentication Service';
    var allowAdmin = req.userDisplay.allowAdmin;
    var time = new Date();

    if (!allowAdmin) {
        //insert message into database
        req.models.Feedback.create({
            username: req.userDisplay.username,
            message: req.body.message,
            sendByAdmin: 0,
            preMessage: "",
            time: time
        }, function (err) {
            var msg = err ? 'Error occured, message not sent.' : 'Message sent! Thank you.';
            var err = err ? true : false;
            if (err) {
                res.sendStatus(500); // internal server error
            } else { // success
                
                var transporter = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: 'csilroombooking@gmail.com',
                    pass: 'csilcsilcsil123'
                    }
                }); 
                //Mail options
                mailOpts = {
                    from: username + ' &lt;' + email + '&gt;', //grab user data
                    to: 'csilroombooking@gmail.com',
                    subject: 'Website contact form',
                    replyTo: email, //administrator can reply to the user directly
                    text: message
                }; 
                // send mail with defined transport object
                transporter.sendMail(mailOpts, function (error, response) {
                    //Email not sent
                    // Jia, I fixed the rendering issue here. -- Chen Song
                    console.log('11');
                    var source = req.userDisplay.type == 'other' ? 'CSIL Account' : 'SFU Central Authentication Service';
                    var allowAdmin = req.userDisplay.allowAdmin;
                    var msg = error ? 'Error occured, message not sent.' : 'Message sent! Thank you.';
                    var err = error ? true : false;
                    res.render('comment', {
                        username: username,
                        source: source,
                        allowAdmin: allowAdmin,
                        page: "Report Violations Send Feedback",
                        csrfToken: req.csrfToken(), 
                        msg: msg, 
                        err: err
                    }); 
                });  
                    
                
                    res.render('comment', {
                    username: username,
                    source: source,
                    allowAdmin: allowAdmin,
                    page: "Report Violations Send Feedback",
                    csrfToken: req.csrfToken(), 
                    msg: msg, 
                    err: err
                });

            }
        });
    }
    else { //admin
        // admin page: /comment/messageid
    }
    
});

/*
 * Author(s)  : Ruiming Jia
 * Description: This function sends admin the user feedback reply page
 * Last Update: July 26, 2017
*/
router.get('/:id', function (req, res) {
    // prepare all view variables
    var username = req.userDisplay.username;
    var source = req.userDisplay.type == 'other' ? 'CSIL Account' : 'SFU Central Authentication Service';
    var allowAdmin = req.userDisplay.allowAdmin;
    var page = "Report Violations Send Feedback";
    //var feedback = {};
    req.models.Feedback.find({id: req.params.id}, function (err, results) {
        if (err || results.length != 1) {
            res.sendStatus(500); // internal server error
        } else {
            var usernameReply = results[0].username;
            var pmessage = results[0].message;
            var path = '/comment/' + req.params.id;
            res.render('comment-reply', {
                username: username,
                usernameReply: usernameReply,
                source: source,
                allowAdmin: allowAdmin,
                page: page,
                path: path,
                pmessage: pmessage,
                csrfToken: req.csrfToken()
            });
        }
    });
});


/*
 * Author(s)  : Ruiming Jia
 * Description: This function allows admin reply to user's feedback and save the message to database
 * Last Update: July 26, 2017
*/
router.post('/:id', csrfProtection, function (req, res) {
    req.models.Feedback.find({id: req.params.id}, function (err, results) {
        if (err || results.length != 1) {
            res.sendStatus(500); // internal server error
        } else {
            var usernameReply = results[0].username;
            var pmessage = results[0].message;

            var time = new Date();
                // prepare all view variables
                req.models.Feedback.create({
                    username: usernameReply,
                    message: req.body.message,
                    sendByAdmin: 1,
                    preMessage: pmessage,
                    time: time
                }, function (err) {
                    var msg = err ? 'Error occured, message not sent.' : 'Message sent! Thank you.';
                    var err = err ? true : false;
                    if (err) {
                        res.sendStatus(500); // internal server error
                    } else { // success
                        var source = req.userDisplay.type == 'other' ? 'CSIL Account' : 'SFU Central Authentication Service';
                        var allowAdmin = req.userDisplay.allowAdmin;
                        res.render('comment-reply', {
                            usernameReply: usernameReply,
                            username: req.userDisplay.username,
                            pmessage: pmessage,
                            source: source,
                            allowAdmin: allowAdmin,
                            page: "Report Violations Send Feedback",
                            csrfToken: req.csrfToken(), 
                            msg: msg, 
                            err: err
                        });       
                    }
                });


        }
    });



    
});

module.exports = router;