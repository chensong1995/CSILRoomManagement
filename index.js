/*
 * Author(s)  : Chen Song
 * Description: This is the entry of the web server logic
 * Last Update: July 7, 2017
*/
////////////////////////////////////////////////////////
// External dependencies
// 1. Express framework
var express = require('express');
var app = express();
// 2. Body Parser
var bodyParser = require('body-parser');
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({extended: true}));
// 3. Cookie Parser
var cookieParser = require('cookie-parser');
app.use(cookieParser());
// 4. https (used for checking SFU CAS ticket)
var https = require('https');
// 5. querystring
var querystring = require('querystring');
// 6. xml parser
var parseString = require('xml2js').parseString;
////////////////////////////////////////////////////////

////////////////////////////////////////////////////////
// Our own middlewares
// 1. Connect to models
var models = require('./models/models.js');
models(app);
// 2. Cookie
var cookie = require('./authentication/cookie.js');
cookie(app);
// 2. Authentication service
var auth = require('./authentication/authentication.js');
////////////////////////////////////////////////////////

////////////////////////////////////////////////////////
// Connect to routers
// 1. Machine live status
var live = require('./controllers/live.js');
app.use('/live', live);
////////////////////////////////////////////////////////


// Author(s)  : Chen Song
// Description: This function handles CAS login
// Last Update: July 7, 2017
app.get('/login', function (req, res) {
    var myURL = 'http://localhost:3000' + req.url;
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
                        res.send(500); // internal server error
                    } else {
                        if (result['cas:serviceResponse']['cas:authenticationSuccess']) {
                            var username = result['cas:serviceResponse']['cas:authenticationSuccess'][0]['cas:user'][0];
                            var type = result['cas:serviceResponse']['cas:authenticationSuccess'][0]['cas:attributes'][0]['cas:authtype'][0];
                            console.log(username + ' ' + type);
                            req.models.User.find({username: username}, function (err, users) {
                                if (err) {
                                    res.send(500); // internal server error
                                } else if (users.length == 0) { // this is a new user
                                    // create this user in the database, with his/her sid

                                } else {
                                    var user = users[0];
                                    user.sid = req.cookies.sid;
                                    user.save(function(err) {
                                        if (err) {
                                            res.send(500); // internal server error
                                        } else {
                                            if (req.query.redirect) { // redirect to the page visited by the user before '/login'
                                                res.redirect(req.query.redirect);
                                            } else {
                                                res.redirect('/'); // redirect to homepage
                                            }
                                        }
                                    });
                                }
                            });

                        } else {
                            res.send(403); // someone fakes a ticket
                        }
                    }
                });
            });
        });
        request.end();
    } else {
        // send the login page
        res.redirect('https://cas.sfu.ca/cas/login?service=' + myURL);
    }
});

// Author(s)  : Chen Song
// Description: This function gives user the homepage
// Last Update: July 7, 2017
app.get('/', auth, function(req, res) {

});

// Author(s)  : Chen Song
// Description: This function starts the web server
// Last Update: July 7, 2017
app.listen(3000, function() {
    console.log('Listening at port 3000');
});

