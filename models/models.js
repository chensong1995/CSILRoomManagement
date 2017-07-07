/*
 * Author(s)  : Chen Song
 * Description: This collects all models we have, and turn them into an orm call.
 * Last Update: July 7, 2017
*/

var orm = require('orm');

// All models we have
// 1. Machine
var machine = require('./machine.js');

module.exports = function (app) {
    app.use(orm.express('mysql://csil:csil@120.27.121.163/csil', {
        define: function (db, models, next) {
            machine(db, models);
            next();
        }
    }));
}