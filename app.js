var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');

// 4. https (used for checking SFU CAS ticket)
var https = require('https');
// 5. querystring
var querystring = require('querystring');
// 6. xml parser
var parseString = require('xml2js').parseString;
// 7. path
var path = require('path');
// 8. url
//const { URLSearchParams } = require('url');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

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
// Last Update: July 8, 2017
app.get('/login', function (req, res) {
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
        res.sendFile('login.html', {root: path.join(__dirname, 'static')});
    }
});


// Author(s)  : Chen Song
// Description: This function gives user js files
// Last Update: July 8, 2017
app.get(/\.js/, function(req, res) {
    res.sendFile(req.url, {root: path.join(__dirname, 'static')});
});

// Author(s)  : Chen Song
// Description: This function gives user the homepage
// Last Update: July 8, 2017
app.get('/', auth, function(req, res) {
    res.end('This is the homepage!');
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
