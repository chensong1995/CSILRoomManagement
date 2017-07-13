/*
 * Author(s)  : Chen Song
 * Description: This is the entry of the web server logic
 * Last Update: July 8, 2017
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
// 4. path
var path = require('path');
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
// 1. Machine live status API
var live = require('./routers/live.js');
app.use('/live', live);
// 2. Login
var login = require('./routers/login.js');
app.use('/login', login);
// 2. Signup
var signup = require('./routers/signup.js');
app.use('/signup', signup);
////////////////////////////////////////////////////////

////////////////////////////////////////////////////////
// Set template engine
app.set('view engine', 'pug');
// Set view folder location
app.set('views', path.join(__dirname, 'views'));
////////////////////////////////////////////////////////

// Author(s)  : Chen Song
// Description: This function gives user js files
// Last Update: July 8, 2017
// app.get(/\.js/, function(req, res) {
//     res.sendFile(req.url, {root: path.join(__dirname, 'static')});
// });

// Author(s)  : Chen Song
// Description: This function gives user the homepage
// Last Update: July 8, 2017
app.get('/', auth, function(req, res) {
    res.end('This is the homepage!');
});

// Author(s)  : Chong
// Description: This function tests the pug template file
// Last Update: July 11, 2017
app.get('/dashboard', auth, function(req, res) {
    res.render('dashboard', { username: "test"});
});

// Author(s)  : Chen Song
// Description: This function starts the web server
// Last Update: July 7, 2017
app.listen(3000, function() {
    console.log('Listening at port 3000');
});

