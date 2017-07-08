/*
 * Author(s)  : Chen Song
 * Description: This file implements a middleware that assigns sid to each user as a cookie.
 * Last Update: July 7, 2017
*/

// Instructions for people who want to use this authentication service: 
// Please see authentication.js

module.exports = function(app) {
    app.use(function (req, res, next) {
      // check if client sent cookie
      var cookie = req.cookies.sid;
      if (cookie === undefined) {
        // no: set a new cookie
        var randomNumber = Math.random().toString();
        randomNumber = randomNumber.substring(2, randomNumber.length);
        res.cookie('sid', randomNumber, { httpOnly: true }); // send the cookie to user
        req.cookies.sid = randomNumber; // pass on the cookie
      } 
      next();
    });
};