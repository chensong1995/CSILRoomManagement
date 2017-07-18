/*
 * Author(s)  : Chen Song
 * Description: This file handles users profile editing/viewing. The entire file is protected by auth
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
 * Author(s)  : Chen Song
 * Description: This function sends users the profile page
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
 * Author(s)  : Chen Song
 * Description: This function allows users to update personal infomation
 * Last Update: July 13, 2017
// Usage      : The client generates a POST request with 1 field: biography (plus csurf token). It will receive 200 if update is successful, and 403 otherwise.
*/

router.post('/', csrfProtection, function (req, res) {
    /* if (req.body.biography) { // must have this field
        req.userDisplay.biography = req.body.biography;
        req.userDisplay.save(function (err) {
            if (err) {
                res.sendStatus(500); // internal server error
            } else {
                res.status(200).end(); // success
            }
        });
    } else {
        res.sendStatus(404); // invalid request
    } */

    var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'csilroombooking@gmail.com',
        pass: 'csilcsilcsil123'
    }
}); 
  //Mail options
    mailOpts = {
      from: 'Csil Booking System <csilroombooking@gmail.com style="margin: 0pt; padding: 0pt;">',//req.body.name + ' &lt;' + req.body.email + '&gt;', //grab form data from the request body object
      to: 'csilroombooking@gmail.com',
      subject: 'Website contact form',
      text: req.body.message
    }; 
    
    transporter.sendMail(mailOpts, function (error, response) {
        /*
        if(error){
        console.log(error);
    }else{
        console.log('Message sent: ' + info.response);
    }  */
    
      //Email not sent
      if (error) {
          res.render('comment', { title: 'Contact', msg: 'Error occured, message not sent.', err: true, page: 'comment' })
      }
      //Yay!! Email sent
      else {
          res.render('comment', { title: 'Contact', msg: 'Message sent! Thank you.', err: false, page: 'comment' })
      } 
  });    
});


module.exports = router;