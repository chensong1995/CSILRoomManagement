/*
 * Author(s)  : Chen Song
 * Description: This file handles signups in our own authentication service.
 * Last Update: July 8, 2017
*/

////////////////////////////////////////////////////////
// External dependencies
// 1. Express framework
var express = require('express');
var router = express.Router();
// 2. bcrypt
var bcrypt = require('bcryptjs');
////////////////////////////////////////////////////////

// Author(s)  : Chen Song
// Description: This function handles CSIL account signup
// Last Update: July 8, 2017
// Usage      : The client generates a POST request with two fields: username and password. It will receive 200 if signup is successful, and 403 if username already exists.
router.post('/', function (req, res) {
    if (req.body.username && req.body.password) { // must have these two fields
        var newUser = {
            username: req.body.username,
            password: encryptPassword(req.body.password),
            type: 'other',
            privilege: 2, // 2 means student
            sid: req.cookies.sid
        };
        req.models.User.create(newUser, function (err) {
            if (err) { // username already exists
                res.sendStatus(403); 
            } else {
                res.status(200).end(); // success
            }
        });
    } else {
        res.sendStatus(403); // invalid signup request
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