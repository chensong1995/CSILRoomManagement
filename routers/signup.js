/*
 * Author(s)  : Chen Song
 * Description: This file handles signups in our own authentication service.
 * Last Update: July 26, 2017
*/

////////////////////////////////////////////////////////
// External dependencies
// 1. Express framework
var express = require('express');
var router = express.Router();
// 2. bcrypt
var bcrypt = require('bcryptjs');
// 3. mailer
var mailer = require('../email/email.js');
////////////////////////////////////////////////////////

// Author(s)  : Chen Song, Ruiming Jia
// Description: This function handles CSIL account signup
// Last Update: July 26, 2017
// Usage      : The client generates a POST request with three fields: username, password, and email. It will receive 200 if signup is successful, and 403 if username already exists.
router.post('/', function (req, res) {
    res.setHeader('Content-Type', 'text/plain');
    if (req.body.username && req.body.password && req.body.email) { // must have these three fields
        var newUser = {
            username: req.body.username,
            password: encryptPassword(req.body.password),
            type: 'other',
            privilege: 2, // 2 means student
            sid: req.cookies.sid,
            email: req.body.email,
            notification: 1
        };
        req.models.User.create(newUser, function (err) {
            if (err) { // username already exists
                res.sendStatus(403); 
            } else {
                // send a email
                var subject = 'Welcome to CSIL Room Management System';
                var text = 'This email confirms that you have created an account on our website. ';
                mailer.send({
                    email: newUser.email,
                    name: newUser.username
                }, subject, text);
                // response
                res.status(200).end(); // success
            }
        });
    } else {
        res.sendStatus(403); // invalid signup request
    }
});


// Author(s)  : Chen Song
// Description: This function checks whether an username is usable
// Last Update: July 14, 2017
// Usage      : The client generates a POST request with 1 field: username. It will receive 200 if username is okay, and 403 if username already exists.
router.post('/check-username', function (req, res) {
    res.setHeader('Content-Type', 'text/plain');
    if (req.body.username) { // must have that field
        req.models.UserDisplay.find({username: req.body.username, type: 'other'}, function (err, users) {
            if (err) {
                res.sendStatus(500); // internal server error 
            } else if (users.length > 0) { // username already exists
                res.sendStatus(403); 
            } else {
                res.status(200).end(); // username ok
            }
        });
    } else {
        res.sendStatus(403); // invalid request
    }
});

// Author(s)  : Chen Song
// Description: This function returns the encrypted password
// Last Update: July 8, 2017
function encryptPassword(password) {
    var salt = 10; // an aribitary number
    return bcrypt.hashSync(password, salt);
}

module.exports = router;