/*
 * Author(s)  : Chen Song, Chong
 * Description: This file handles logout (CAS and our own authentication service).
 * Last Update: July 22, 2017
*/

////////////////////////////////////////////////////////
// External dependencies
// 1. Express framework
var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {
    req.models.UserDisplay.find({sid: req.cookies.sid}, function(err, users) {
        if (err || users.length != 1) {
            res.sendStatus(500); // internal server error
        } else {
            var user = users[0];
            user.sid = ''; // clear sid
            user.save(function (err) {
                if (err) {
                    res.sendStatus(500); // internal server error
                } else {
                    if (user.type == 'other') { // user logged in using the csil account
                        res.redirect('/login');
                    } else { // sfu user
                        var myapp = 'http://' + req.headers.host + ":8080";
                        res.redirect('https://cas.sfu.ca/cas/appLogout?app=' + myapp + '&url=' + myapp);
                    }
                }
            });
        } 
    });

});

module.exports = router;