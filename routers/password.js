/*
 * Author(s)  : Chen Song, Chong
 * Description: This file handles password update. Only CSIL account users can change their passwords. CAS users are not allowed to do this.
 * Last Update: July 14, 2017
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
// Description: This function handles password update. It does not require CSRF protection. There is no need to do so, since the client must provide old password.
// Last Update: July 14, 2017
// Usage      : The client generates a POST request with two fields: oldpassword, and newpassword. It will receive 200 if update is successful, and 403 if otherwise.
router.post('/', function (req, res) {
    res.setHeader('Content-Type', 'text/plain');
    if (req.body.oldpassword && req.body.newpassword) { // must have these three fields
        if (req.userDisplay.type == 'other' && isPasswordOk(req.body.oldpassword, req.userDisplay.password)) {
            req.userDisplay.password = encryptPassword(req.body.newpassword);
            req.userDisplay.save(function (err) {
                if (err) {
                    res.send(err);
                    res.sendStatus(500); // internal server error
                } else {
                    res.status(200).end(); // good
                }
            });
        } else {
            res.sendStatus(403); // invalid password request
        }
    } else {
        res.sendStatus(403); // invalid password request
    }
});

// Author(s)  : Chen Song
// Description: This function returns the encrypted password
// Last Update: July 8, 2017
function encryptPassword(password) {
    var salt = 10; // an aribitary number
    return bcrypt.hashSync(password, salt);
}

// Author(s)  : Chen Song
// Description: This function checks whether the password received from the client is valid
// Last Update: July 8, 2017
function isPasswordOk(user_input, db_storage) {
  return bcrypt.compareSync(user_input, db_storage); // true 
}

module.exports = router;
