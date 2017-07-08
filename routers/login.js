/*
 * Author(s)  : Chen Song
 * Description: This file handles login (CAS and our own authentication service).
 * Last Update: July 8, 2017
*/

////////////////////////////////////////////////////////
// External dependencies
// 1. Express framework
var express = require('express');
var router = express.Router();
// 2. https (used for checking SFU CAS ticket)
var https = require('https');
// 3. querystring
var querystring = require('querystring');
// 4. xml parser
var parseString = require('xml2js').parseString;
// 5. path
var path = require('path');
// 6. url
const { URLSearchParams } = require('url');
////////////////////////////////////////////////////////

// Author(s)  : Chen Song
// Description: This function handles CAS login
// Last Update: July 8, 2017
router.get('/', function (req, res) {
    var params = new URLSearchParams(req.query);
    if (params.has('ticket')) {
        params.delete('ticket');
    }
    var myURL = 'http://localhost:3000/login';
    if (params.toString().length != 0) {
        myURL = myURL + '?' + params.toString();
    }
    if (req.query.ticket) { // this is an redirect from the CAS server
        // check if the ticket is valid
        var options = {
            host: 'cas.sfu.ca',
            path: '/cas/serviceValidate?ticket=' + req.query.ticket + '&service=' + myURL,
            method: 'GET'
        };
        // A valid ticket leads to a response like this:
        // <cas:serviceResponse xmlns:cas='http://www.yale.edu/tp/cas'>
        //     <cas:authenticationSuccess>
        //         <cas:user>csa102</cas:user>
        //         <cas:attributes>
        //             <cas:authtype>sfu</cas:authtype>
        //             <cas:tgt2>TGT-97175-kcopG7RxgvOCEAeIwpJeCqOJOQLos7MgPEkyAhH1ir9m70Z37n-cas3</cas:tgt2>
        //         </cas:attributes>
        //     </cas:authenticationSuccess>
        // </cas:serviceResponse>
        //
        // An invalid ticket leads to a response like this:
        // <cas:serviceResponse xmlns:cas='http://www.yale.edu/tp/cas'>
        //     <cas:authenticationFailure code='INVALID_TICKET'>
        //         ticket &#039;ST-1125992-wVMY9yETogYTL7FYSxQy&#039; not recognized
        //     </cas:authenticationFailure>
        // </cas:serviceResponse>
        var request = https.request(options, function (casRes) {
            casRes.on('data', function (xml) {
                parseString(xml, function (err, result) {
                    if (err) {
                        res.sendStatus(500); // internal server error
                    } else {
                        if (result['cas:serviceResponse']['cas:authenticationSuccess']) {
                            var username = result['cas:serviceResponse']['cas:authenticationSuccess'][0]['cas:user'][0];
                            var type = result['cas:serviceResponse']['cas:authenticationSuccess'][0]['cas:attributes'][0]['cas:authtype'][0];
                            req.models.UserDisplay.find({username: username}, function (err, users) {
                                var doRedirect = function (err) {
                                    if (err) {
                                        res.sendStatus(500); // internal server error
                                    } else {
                                        if (req.query.redirect) { // redirect to the page visited by the user before '/login'
                                            res.redirect(req.query.redirect);
                                        } else {
                                            res.redirect('/'); // redirect to homepage
                                        }
                                    }
                                };
                                if (err) {
                                    res.sendStatus(500); // internal server error
                                } else if (users.length == 0) { // this is a new user
                                    // create this user in the database, with his/her sid
                                    var newUser = {
                                        username: username,
                                        password: '',
                                        type: type,
                                        privilege: 2, // 2 means student
                                        sid: req.cookies.sid
                                    };
                                    req.models.User.create(newUser, doRedirect);
                                } else {
                                    var user = users[0];
                                    user.sid = req.cookies.sid;
                                    user.save(doRedirect);
                                }
                            });

                        } else {
                            res.sendStatus(403); // someone fakes a ticket
                        }
                    }
                });
            });
        });
        request.end();
    } else {
        // send the login page
        res.sendFile('login.html', {root: path.join(__dirname, '/../static')});
    }
});

module.exports = router;