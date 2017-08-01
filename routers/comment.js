/*
 * Author(s)  : Ruiming Jia, Chen Song
 * Description: This file handles feedback from users.
 * Last Update: July 27, 2017
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
 * Author(s)  : Ruiming Jia, Chen Song, John Liu
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
        csrfToken: req.csrfToken(),
        reportMachine: req.query.MachineName,
        MachineRoom: req.query.RoomNumber,
    });
});
/*
 * Author(s)  : Ruiming Jia
 * Description: This function sends the feedback-view page
 * Last Update: July 26, 2017
*/
router.get('/view', function (req, res) {
    // prepare all view variables
    var username = req.userDisplay.username;
    var source = req.userDisplay.type == 'other' ? 'CSIL Account' : 'SFU Central Authentication Service';
    var allowAdmin = req.userDisplay.allowAdmin;
    var page = "Report Violations View Feedback";
    if (!allowAdmin) { //user page
        //feedbacks from admin
        var feedbacksAdmin = [];
        req.models.Feedback.find({uid: req.userDisplay.id, sendByAdmin: 1}, [ "time", "Z" ], function (err, results) {
            if (err) {
                res.sendStatus(500); // internal server error
            } else {
                for (var i = 0; i < results.length; i++) {
                    feedbacksAdmin.push({
                        username: results[i].username,      
                        message: results[i].message,        //message from admin
                        pmessage: results[i].preMessage,    //user's original message
                        time: results[i].time.toLocaleString(undefined, {timeZone: 'America/Vancouver'}),
                        path: '/comment/' + results[i].id
                    });
                }                
            }
        });
        var feedbacks = [];
        //fetch user's previous feedbacks from database
        req.models.Feedback.find({uid: req.userDisplay.id, sendByAdmin: 0}, [ "time", "Z" ], function (err, results) {
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
                    feedbacksAdmin: feedbacksAdmin,
                    csrfToken: req.csrfToken()
                });
            }
        });
    }
    else { //admin page
        var feedbacksNotReplied = [];
        //fetch feedbacks not replied 
        req.models.Feedback.find({sendByAdmin: 0, replied: 0}, [ "time", "Z" ], function (err, results) {
            if (err) {
                res.sendStatus(500); // internal server error
            } else {
                for (var i = 0; i < results.length; i++) {
                    if (results[i].preMessage != "" ) {
                        hasPreMsg = true;
                    } else {
                        hasPreMsg = false;
                    }
                    feedbacksNotReplied.push({
                        username: results[i].username,
                        message: results[i].message,
                        hasPreMsg: hasPreMsg,
                        pmessage: results[i].preMessage,
                        time: results[i].time.toLocaleString(undefined, {timeZone: 'America/Vancouver'}),
                        path: '/comment/' + results[i].id
                    });
                }
            }
        });
        var feedbacksReplied = [];
        req.models.Feedback.find({sendByAdmin: 0, replied: 1}, [ "time", "Z" ], function (err, results) {
            if (err) {
                res.sendStatus(500); // internal server error
            } else {
                for (var i = 0; i < results.length; i++) {
                    if (results[i].preMessage != "" ) {
                        hasPreMsg = true;
                    } else {
                        hasPreMsg = false;
                    }
                    feedbacksReplied.push({
                        username: results[i].username,
                        message: results[i].message,
                        hasPreMsg: hasPreMsg,
                        pmessage: results[i].preMessage,
                        time: results[i].time.toLocaleString(undefined, {timeZone: 'America/Vancouver'}),
                        path: '/comment/' + results[i].id
                    });
                }
                res.render('admin-comment-view', {
                    username: username,
                    source: source,
                    allowAdmin: allowAdmin,
                    hasPreMsg: hasPreMsg,
                    page : "View Feedback",
                    feedbacksNotReplied: feedbacksNotReplied,
                    feedbacksReplied: feedbacksReplied,
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
    var uid = req.userDisplay.id;
    var email = req.userDisplay.email;
    var source = req.userDisplay.type == 'other' ? 'CSIL Account' : 'SFU Central Authentication Service';
    var allowAdmin = req.userDisplay.allowAdmin;
    var time = new Date();
    // user page: send feedback
    if (!allowAdmin) {
        //insert message into database
        req.models.Feedback.create({
            username: req.userDisplay.username,
            uid: uid,
            message: req.body.message,
            sendByAdmin: 0,
            preMessage: "",
            time: time,
            replied: 0
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
            }
        });
    }
    else { //admin
        // admin reply to a message: /comment/messageID
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
    //user reply to admin
    if (!allowAdmin){
        req.models.Feedback.find({id: req.params.id}, function (err, results) {
            if (err || results.length != 1) {
                res.sendStatus(500); // internal server error
            } else {
                var usernameReply = "Admin";
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
    }
    //admin reply to user
    else {
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
    }
});
/*
 * Author(s)  : Ruiming Jia
 * Description: This function allows admin reply to user's feedback and save the message to database, also handles user's reply
 * Last Update: July 26, 2017
*/
router.post('/:id', csrfProtection, function (req, res) {
    var allowAdmin = req.userDisplay.allowAdmin;
    //admin send message to user
    if (allowAdmin) {
        req.models.Feedback.find({id: req.params.id}, function (err, results) {
            if (err || results.length != 1) {
                res.sendStatus(500); // internal server error
            } else {
                var usernameReply = results[0].username;
                var pmessage = results[0].message;
                var uid = results[0].uid;
                var time = new Date();
                results[0].replied = 1;
                results[0].save();
                req.models.Feedback.create({
                    username: usernameReply,
                    uid: uid,
                    message: req.body.message,
                    sendByAdmin: 1,
                    preMessage: pmessage,
                    time: time,
                    replied: 0
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
    }
    else {
        //user send message to Admin
        req.models.Feedback.find({id: req.params.id}, function (err, results) {
            if (err || results.length != 1) {
                res.sendStatus(500); // internal server error
            } else {
                var usernameReply = results[0].username;
                var pmessage = results[0].message;
                var uid = results[0].uid;
                var time = new Date();
                // prepare all view variables
                req.models.Feedback.create({
                    username: usernameReply,
                    uid: uid,
                    message: req.body.message,
                    sendByAdmin: 0,
                    preMessage: pmessage,
                    time: time,
                    replied: 0
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
    }   
});
module.exports = router;