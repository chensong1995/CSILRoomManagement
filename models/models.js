/*
 * Author(s)  : Chen Song
 * Description: This collects all models we have, and turn them into an orm call.
 * Last Update: July 8, 2017
*/

var orm = require('orm');

// All models we have
var machine = require('./machine.js');
var userDisplay = require('./user-display.js');
var user = require('./user.js');

module.exports = function (app) {
    app.use(orm.express('mysql://csil:csil@120.27.121.163/csil', {
        define: function (db, models, next) {
            machine(db, models);
            userDisplay(db, models);
            user(db, models);
            next();
        }
    }));
}