/*
 * Author(s)  : Chen Song
 * Description: This file handles users profile editing/viewing. The entire file is protected by auth
 * Last Update: July 14, 2017
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

router.use(csrfProtection);

/*
 * Author(s)  : Chen Song
 * Description: This function sends users the profile page
 * Last Update: July 14, 2017
*/
router.get('/', function (req, res) {
    // prepare all view variables
    var username = req.userDisplay.username;
    var email = req.userDisplay.email;
    var source = req.userDisplay.type == 'other' ? 'CSIL Account' : 'SFU Central Authentication Service';
    var notification = req.userDisplay.notification;
    var biography = req.userDisplay.biography;
    var allowAdmin = req.userDisplay.allowAdmin;
    var maxBookings = req.userDisplay.maxBookings;

    res.render('profile', {
        username: username,
        email: email,
        source: source,
        notification: notification,
        biography: biography,
        allowAdmin: allowAdmin,
        maxBookings: maxBookings,
        csrfToken: req.csrfToken()
    });
});

/*
 * Author(s)  : Chen Song
 * Description: This function allows users to update personal infomation
 * Last Update: July 14, 2017
 * Usage      : The client generates a POST request with 2 fields: notification, and biography (plus csurf token). It will receive 200 if update is successful, and 403 otherwise.
*/
router.post('/', csrfProtection, function (req, res) {
    res.setHeader('Content-Type', 'text/plain');
    if (req.body.biography !== undefined && req.body.notification !== undefined) { // must have these two fields
        req.userDisplay.biography = req.body.biography;
        req.userDisplay.notification = req.body.notification;
        req.userDisplay.save(function (err) {
            if (err) {
                res.sendStatus(500); // internal server error
            } else {
                res.status(200).end(); // success
            }
        });
    } else {
        res.sendStatus(404); // invalid request
    }
});


module.exports = router;