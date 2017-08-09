/*
 * Author(s)  : Chen Song
 * Description: This file sends users the csil policy. The entire file is protected by auth
 * Last Update: July 16, 2017
*/

////////////////////////////////////////////////////////
// External dependencies
// 1. Express framework
var express = require('express');
var router = express.Router();
// 2. Admin authetication
var adminAuth = require('../authentication/admin.js');
// 3. csurf protection
var csurf = require('csurf'); 
var csrfProtection = csurf({ cookie: true });
router.use(csrfProtection);
////////////////////////////////////////////////////////

/*
 * Author(s)  : Chen Song
 * Description: This function sends users the policy page
 * Last Update: July 15, 2017
*/
router.get('/', function (req, res) {
    // prepare all view variables
    var username = req.userDisplay.username;
    var source = req.userDisplay.type == 'other' ? 'CSIL Account' : 'SFU Central Authentication Service';
    var allowAdmin = req.userDisplay.allowAdmin;
    var page = "Lab Policies";
    var oldPolicy = "";
    var lastUpdate = "";
    req.models.Announcement.get(1, function (err, policy) {
        if (err) {
            res.sendStatus(500); // internal server error
        } else {
            oldPolicy = policy.content;
            lastUpdate = (new Date(policy.time)).toLocaleString(undefined, {timeZone: 'America/Vancouver'});
            res.render('policy', {
                username: username,
                source: source,
                allowAdmin: allowAdmin,
                page: page,
                oldPolicy: oldPolicy,
                lastUpdate: lastUpdate,
                csrfToken: req.csrfToken()
            });
        }
    });
});

/*
 * Author(s)  : Chen Song
 * Description: This function allows admin to modify the policy
 * Last Update: July 15, 2017
 * Usage      : The client generates a POST request with 1 field: content (plus csrf token). It will receive 200 if update is successful, and 403 if otherwise.
*/
router.post('/', [adminAuth, csrfProtection], function (req, res) {
    if (req.body.content !== undefined) { // must have this field
        // the policy is actually announcement 1
        req.models.Announcement.get(1, function (err, policy) {
            if (err) {
                res.sendStatus(500); // internal server error
            } else {
                policy.content = req.body.content;
                policy.time = new Date();
                policy.save(function (err) {
                    if (err) {
                        res.sendStatus(500); // internal server error
                    } else {
                        res.status(200).end(); // success
                    }
                });
            }
        });
    } else {
        res.sendStatus(403); // invalid request
    }
});

module.exports = router;
