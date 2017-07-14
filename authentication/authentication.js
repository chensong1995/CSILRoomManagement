/*
 * Author(s)  : Chen Song
 * Description: This file implements the authentication service as a middleware.
 * Last Update: July 13, 2017
*/

// Instructions for people who want to use this authentication service: 
// 1. Add these lines to your code
//   var cookie = require('./authentication/cookie.js');
//   cookie(app);
//   var auth = require('/path/to/authentication.js'); // must be after cookie
// 2. Add auth as a middleware to your request handlers:
//   e.g.:     app.get('/hello', auth, function(req, res) {...});
// 3. After login, the user will be automatically redirected to '/hello'
// 4. You can access the entire UserDisplay object as req.user

var orm = require('orm');

module.exports = function (req, res, next) {
    req.models.UserDisplay.find({sid: req.cookies.sid}, function(err, users) {
        if (err || users.length > 1) { // error occurs, or more than 1 such users are found
            res.status(500).end(); // internal server error
        } else if (users.length == 0) {
            // user is not logged in
            res.redirect('/login' + '?redirect=' + req.originalUrl);
        } else {
            req.userDisplay = users[0];
            next();
        }
    });
};