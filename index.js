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
////////////////////////////////////////////////////////

////////////////////////////////////////////////////////
// Connect to models
var models = require('./models/models.js');
models(app);
////////////////////////////////////////////////////////

////////////////////////////////////////////////////////
// Connect to routers
// 1. Machine live status
var live = require('./controllers/live.js');
app.use('/live', live);
////////////////////////////////////////////////////////


// Author(s)  : Chen Song
// Description: This function starts the web server
// Last Update: July 7, 2017
app.listen(3000, function() {
    console.log('Listening at port 3000');
});

