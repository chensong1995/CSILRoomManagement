/*
 * Author(s)  : Ruiming Jia
 * Description: This file handles feedback from users.
 * Last Update: July 13, 2017
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
 * Author(s)  : Ruiming Jia
 * Description: This function sends the feedback page
 * Last Update: July 13, 2017
*/
router.get('/', function (req, res) {
    // prepare all view variables
    var username = req.userDisplay.username;
    var email = req.userDisplay.email;
    res.render('comment', {
        username: username,
        email: email,
        csrfToken: req.csrfToken()
    });
});

/*
 * Author(s)  : Ruiming Jia
 * Description: This function allows users to send feedback
 * Last Update: July 13, 2017
*/

router.post('/', csrfProtection, function (req, res) {
    var message = req.body.message;
    var username = req.userDisplay.username;
    var email = req.userDisplay.email;
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
        if (error) {
          res.render('comment', { csrfToken: req.csrfToken(), msg: 'Error occured, message not sent.', err: true })
        }
        //Email sent
        else {
          res.render('comment', { csrfToken: req.csrfToken(), msg: 'Message sent! Thank you.', err: false })
        }   
    });    
});


module.exports = router;